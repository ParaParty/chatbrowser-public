import { escapeUTF8 } from 'entities'
import linkifyHtml from 'linkify-html'
import cqFaces from 'virtual:cq-faces.js'

interface CqContext {
  options: ReturnType<typeof useOptions>
  imageCache: ReturnType<typeof useImageCache>
  msgs: ReturnType<typeof useMsgs>
}

// helpers
const cqDecode = (str: string) => str
  .replace(/&amp;/g, '&')
  .replace(/&#91;/g, '[')
  .replace(/&#93;/g, ']')
  .replace(/&#44;/g, ',')
const linkify = (str: string) =>
  linkifyHtml(str, {
    className: 'tx-sky-500',
    rel: 'noopener noreferrer',
    target: {
      url: '_blank',
    },
  })
const cqText = (str = '') => linkify(escapeUTF8(cqDecode(str)))
const cqParseAttr = (str: string) =>
  Object.fromEntries(
    str
      .split(',')
      .filter(Boolean)
      .map((p) => {
        const [, k, v] = p.match(/^(\w+)=(.*)$/)!
        return [k, cqDecode(v)]
      }),
  ) as Record<string, string>

// blocks
const cqImage = async ({ options, imageCache }: CqContext, file: string, url: string) => {
  const src = options.getImageUrl(file, url, 256, 256)

  // preload dimensions
  let dimensions = imageCache.dims.get(src) ?? ''
  if (!dimensions) {
    try {
      const img = new Image()
      img.src = src
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      dimensions = ` width="${img.width}" height="${img.height}"`
      imageCache.dims.set(src, dimensions)
    }
    catch (e) {
      console.error(e)
    }
  }

  return `<img data-zoomable class="max-w-64 max-h-64 w-auto h-auto" src="${src}"${dimensions} data-zoom-src="${options.getImageUrl(file, url)}">`
}
const cqMension = ({ msgs }: CqContext, qq: string) => {
  if (msgs.users.has(qq)) {
    const user = msgs.users.get(qq)!
    return `<span class="text-sky-500">@${cqText(user.displayName || user.nick)}</span>`
  }
  else {
    return `<span class="text-sky-300">@${cqText(qq)}</span>`
  }
}
const cqReply = (ctx: CqContext, id: string, qq?: string) => {
  let res = '<div class="inline-flex gap-1"><div class="st w-.5 bg-sky-300"></div><div class="tx-sm tx-gray-500">'
  res += `回复 ${cqText(id)}`
  if (qq)
    res += ` ${cqMension(ctx, qq)}`
  res += '</div></div><br />'
  return res
}
const cqFace = async (id: string) => {
  const url = cqFaces[id]
  if (url)
    return `<img class="inline w-1.5em h-1.5em" src="${url}">`
  return ''
}

export const cqRender = async (content: string) => {
  const ctx = {
    options: useOptions(),
    imageCache: useImageCache(),
    msgs: useMsgs(),
  }
  const { options } = ctx

  let left = content
  let res = ''
  while (left.length > 0) {
    const match = left.match(/\[CQ:(\w+)(,[^\]]+)?\]/)
    if (!match) {
      res += cqText(left)
      break
    }

    // push the text before the code
    res += cqText(left.slice(0, match.index!))
    left = left.slice(match.index! + match[0].length)

    const [, type, attr] = match
    const attrs = cqParseAttr(attr)
    switch (type) {
      // [CQ:image,file=000.image,subType=0,url=https://gchat.qpic.cn/..]
      case 'image': {
        res += await cqImage(ctx, attrs.file, attrs.url)
        break
      }
      // [CQ:reply,id=123456789][CQ:at,qq=123456789]
      case 'reply': {
        const matchAt = left.match(/^\[CQ:at,qq=(\d+)\]/)
        if (matchAt)
          left = left.slice(matchAt[0].length)
        left = left.trimStart()

        res += cqReply(ctx, attrs.id, matchAt?.[1])

        break
      }
      // [CQ:at,qq=123456789]
      case 'at': {
        res += cqMension(ctx, attrs.qq)
        break
      }
      // [CQ:face,id=1]
      case 'face': {
        res += await cqFace(attrs.id)
        break
      }
      default: {
        if (options.showUnsupportedCQCodes)
          res += `<span class="tx-gray-400">${escapeUTF8('[CQ:' + `${type}${attr}]`)}</span>`
        break
      }
    }
  }

  return res
}
