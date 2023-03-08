import { $fetch } from 'ohmyfetch'
import type { ApiMsg, ApiUserInfo } from '@/composables/fetch'
// import builtinUsers from '@/assets/users.json'
import { cqRender } from '@/composables/cq'

export interface StoredUserInfo extends ApiUserInfo {
  updatedAt: number
}

export interface SearchFilterKeyword {
  type: 'keyword'
  keyword: string
  filter: string
}

export interface SearchFilterFromUser {
  type: 'fromUser'
  userId: string
  userName?: string
  filter: string
}

export type SearchFilter = SearchFilterKeyword | SearchFilterFromUser

export type StoredMsg = ApiMsg & {
  html: string
  top?: boolean
  end?: boolean
}

const render = async (msg: ApiMsg): Promise<StoredMsg> => ({
  ...msg,
  html: await cqRender(msg.attributes.content),
})

const renderList = (msgs: ApiMsg[]): Promise<StoredMsg[]> =>
  Promise.all(msgs.map(render))

export const useMsgs = defineStore('msgs', () => {
  const routeQuery = new URLSearchParams(window.location.search)
  const options = useOptions()

  const highlightMsgId = ref<string | undefined>(routeQuery.get('msgid') || undefined)
  watch(highlightMsgId, (msgId) => {
    const query = new URLSearchParams(window.location.search)
    if (msgId)
      query.set('msgid', msgId)
    else
      query.delete('msgid')
    const queryString = query.toString()
    if (queryString)
      window.history.replaceState({}, '', `${window.location.pathname}?${queryString}`)
    else
      window.history.replaceState({}, '', window.location.pathname)
  })

  // const sort = ref('-sendTime')
  const searchFilters = ref<SearchFilter[]>([])
  const searchFilter = computed(() => {
    if (highlightMsgId.value)
      return ''

    const filters = searchFilters.value
      .filter(Boolean)
      .map(f => f.filter)

    if (!filters.length)
      return ''
    if (filters.length === 1)
      return filters[0]

    // join filters as and(filter1,and(filter2,and(filter3,filter4)))
    let filter = filters[0]
    for (let i = 1; i < filters.length; i++)
      filter = `and(${filter},${filters[i]})`
    return filter
  })

  const msgDatas = ref<StoredMsg[]>([])

  const msgPointer = ref(0)
  const msgs = computed(() => msgDatas.value.slice(msgPointer.value, msgPointer.value + options.screenPageSize))

  const users = reactive<Map<string, StoredUserInfo>>(new Map())
  // for (const user of builtinUsers)
  //   users.set(user.id, user)
  watch(msgDatas, () => {
    for (const msg of msgDatas.value) {
      const msgDate = +new Date(msg.attributes.sendTime) / 1000

      const set = () => {
        users.set(msg.attributes.fromUserId, {
          ...msg.attributes.fromUserInfo,
          updatedAt: msgDate,
        })
        for (const filter of searchFilters.value) {
          if (filter.type === 'fromUser' && filter.userId === msg.attributes.fromUserId)
            filter.userName = msg.attributes.fromUserInfo.displayName || msg.attributes.fromUserInfo.nick
        }
      }

      if (!users.has(msg.attributes.fromUserId)) {
        set()
        continue
      }

      const stored = users.get(msg.attributes.fromUserId)!
      if (stored.updatedAt < msgDate)
        set()
    }
  })

  const fetching = ref(false)
  const {
    pause: pauseKeywordRefresh,
    resume: resumeKeywordRefresh,
  } = watchPausable(searchFilter, async () => {
    if (fetching.value)
      await until(fetching).toBe(false)
    fetching.value = true

    msgDatas.value = []
    msgPointer.value = 0
    highlightMsgId.value = undefined

    const { data } = await $fetch<{
      data: ApiMsg[]
    }>(`${import.meta.env.VITE_BACKEND_BASE}/logChatGenerals`, {
      params: {
        'sort': '-sendTime',
        'page[size]': options.fetchPageSize,
        'page[number]': 1,
        ...searchFilter.value
          ? {
              filter: searchFilter.value,
            }
          : {},
      },
      headers: {
        token: options.fetchToken,
      },
    })

    msgDatas.value = await renderList(data.reverse())
    msgDatas.value[msgDatas.value.length - 1].end = true

    await nextTick()

    fetching.value = false
  }, { immediate: !highlightMsgId.value })

  const fetchBefore = async () => {
    if (!msgDatas.value.length)
      return

    if (fetching.value)
      return
    fetching.value = true

    if (msgPointer.value > 0) {
      msgPointer.value = Math.max(0, msgPointer.value - options.fetchPageSize)
    }
    else {
      const time = msgDatas.value[0].attributes.sendTime

      const res = await $fetch<{
        data: ApiMsg[]
      }>(`${import.meta.env.VITE_BACKEND_BASE}/logChatGenerals`, {
        params: {
          'filter': searchFilter.value
            ? `and(${searchFilter.value},lessThan(sendTime,'${time}'))`
            : `lessThan(sendTime,'${time}')`,
          'sort': '-sendTime',
          'page[size]': options.fetchPageSize,
          'page[number]': 1,
        },
        headers: {
          token: options.fetchToken,
        },
      })

      if (!res.data.length)
        msgDatas.value[0].top = true
      else
        msgDatas.value = (await renderList(res.data.reverse())).concat(msgDatas.value)
    }

    await nextTick()
    fetching.value = false
  }

  const fetchAfter = async () => {
    if (!msgDatas.value.length)
      return

    if (fetching.value)
      return
    fetching.value = true

    if (msgPointer.value + options.screenPageSize < msgDatas.value.length) {
      msgPointer.value = Math.min(msgDatas.value.length - options.screenPageSize, msgPointer.value + options.fetchPageSize)
    }
    else {
      const time = msgDatas.value[msgDatas.value.length - 1].attributes.sendTime

      const res = await $fetch<{
        data: ApiMsg[]
      }>(`${import.meta.env.VITE_BACKEND_BASE}/logChatGenerals`, {
        params: {
          'filter': searchFilter.value
            ? `and(${searchFilter.value},greaterThan(sendTime,'${time}'))`
            : `greaterThan(sendTime,'${time}')`,
          'sort': 'sendTime',
          'page[size]': options.fetchPageSize,
          'page[number]': 1,
        },
        headers: {
          token: options.fetchToken,
        },
      })

      msgDatas.value = msgDatas.value.concat(await renderList(res.data))

      if (res.data.length === 0)
        msgDatas.value[msgDatas.value.length - 1].end = true

      msgPointer.value = msgDatas.value.length - options.screenPageSize
    }

    await nextTick()
    fetching.value = false
  }

  const loadAfter = async () => {
    if (fetching.value)
      return
    fetching.value = true

    msgPointer.value = Math.max(0, Math.min(msgDatas.value.length - options.screenPageSize, msgPointer.value + options.fetchPageSize))

    await nextTick()
    fetching.value = false
  }

  const toBottom = () => {
    msgPointer.value = Math.max(0, msgDatas.value.length - options.screenPageSize)
  }

  const onJumpTo = useEventBus<ApiMsg>('jumpTo')
  const jumpTo = async (msg: ApiMsg) => {
    if (fetching.value)
      return
    fetching.value = true

    pauseKeywordRefresh()
    highlightMsgId.value = msg.id
    msgDatas.value = []

    const time = msg.attributes.sendTime

    const resBefore = await $fetch<{
      data: ApiMsg[]
    }>(`${import.meta.env.VITE_BACKEND_BASE}/logChatGenerals`, {
      params: {
        'filter': `lessThan(sendTime,'${time}')`,
        'sort': '-sendTime',
        'page[size]': options.fetchPageSize,
        'page[number]': 1,
      },
      headers: {
        token: options.fetchToken,
      },
    })
    const before = resBefore.data.reverse()

    const resAfter = await $fetch<{
      data: ApiMsg[]
    }>(`${import.meta.env.VITE_BACKEND_BASE}/logChatGenerals`, {
      params: {
        'filter': `greaterThan(sendTime,'${time}')`,
        'sort': 'sendTime',
        'page[size]': options.fetchPageSize,
        'page[number]': 1,
      },
      headers: {
        token: options.fetchToken,
      },
    })
    const after = resAfter.data

    msgDatas.value = await renderList(before.concat(msg, after))

    if (after.length < options.fetchPageSize)
      msgDatas.value[msgDatas.value.length - 1].end = true

    msgPointer.value = 0

    await nextTick()
    resumeKeywordRefresh()

    onJumpTo.emit(msg)

    fetching.value = false
  }

  if (highlightMsgId.value) {
    (async () => {
      fetching.value = true

      const { data } = await $fetch<{
        data: ApiMsg[]
      }>(`${import.meta.env.VITE_BACKEND_BASE}/logChatGenerals`, {
        params: {
          'sort': '-sendTime',
          'page[size]': 1,
          'page[number]': 1,
          'filter': `equals(id,'${highlightMsgId.value}')`,
        },
        headers: {
          token: options.fetchToken,
        },
      })

      const msg = data[0]
      fetching.value = false

      if (msg) {
        jumpTo(msg)
      }
      else {
        highlightMsgId.value = undefined
        triggerRef(searchFilter)
      }
    })()
  }

  return {
    msgs,
    msgDatas,
    fetching,
    highlightMsgId,

    searchFilters,
    searchFilter,

    users,

    fetchBefore,
    fetchAfter,
    loadAfter,
    toBottom,
    jumpTo,

    onJumpTo,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMsgs, import.meta.hot))
