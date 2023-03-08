<script lang="ts" setup>
import type { ApiMsg } from '@/composables/fetch'

const msgEl = $shallowRef<HTMLDivElement>()
const msgEls = $computed<HTMLDivElement[]>(() => msgEl
  ? [].slice.call(msgEl.childNodes, 1, msgEl.childNodes.length - 1)
      .filter((el: Node) => el.nodeType === 1)
  : [])
const beforeMsgsEl = $shallowRef<HTMLDivElement>()
const afterMsgsEl = $shallowRef<HTMLDivElement>()

const msgs = useMsgs()

let domUpdateTrigger = $ref(false)
watch(() => msgs.msgs, async () => {
  if (!msgEl)
    return

  if (domUpdateTrigger)
    return
  domUpdateTrigger = true

  triggerRef($$(msgEl))
  const authorEl = [...msgEls].reverse().find(el => el.offsetTop < msgEl.scrollTop + msgEl.clientHeight)
  const authorRect = authorEl?.getBoundingClientRect()

  await nextTick()

  if (authorEl?.parentElement && authorRect) {
    const authorRectNew = authorEl.getBoundingClientRect()
    const offset = authorRectNew.top - authorRect.top
    msgEl.scrollTop += offset
  }
  else {
    msgEl.scrollTop = 1 << 30
  }

  domUpdateTrigger = false
})

useIntersectionObserver($$(beforeMsgsEl), ([{ isIntersecting }]) => {
  if (isIntersecting)
    msgs.fetchBefore()
}, { rootMargin: `${window.innerHeight * 0.4}px 0px`, root: $$(msgEl) })
useIntersectionObserver($$(afterMsgsEl), ([{ isIntersecting }]) => {
  if (isIntersecting)
    msgs.loadAfter()
}, { rootMargin: `${window.innerHeight * 0.4}px 0px`, root: $$(msgEl) })

onMounted(() => {
  msgEl.scrollTop = 1 << 30
})

const { arrivedState } = useScroll($$(msgEl))

const onJumpTo = (msg: ApiMsg) => {
  msgs.jumpTo(msg)
}
msgs.onJumpTo.on(async (msg: ApiMsg) => {
  let authorEl
  let retry = 0
  for (;;) {
    if (!msgEl)
      return

    triggerRef($$(msgEl))
    authorEl = msgEls.find(el => el.dataset.msgid === msg.id)

    if (!domUpdateTrigger && authorEl)
      break

    if (retry++ > 10)
      return

    await nextTick()
  }

  msgEl.scrollTop = authorEl.offsetTop + authorEl.clientHeight - msgEl.clientHeight * 2 / 3
})
</script>

<template>
  <div class="re fa fc min-h-0">
    <div class="z-50 ab r-2 t-12 rd-full sd-md bg-white">
      <div v-if="msgs.fetching" class="i-carbon:smoothing m-1 w-6 h-6 tx-gray-500 animate-spin" />
      <div
        v-else-if="arrivedState.bottom"
        class="i-carbon:rotate-360 m-1 w-6 h-6 tx-gray-500 cursor-pointer"
        @click="async () => {
          await msgs.fetchAfter()
          await nextTick()
          if (msgEl)
            msgEl.scrollTop = msgEl.scrollHeight
        }"
      />
      <div
        v-else
        class="i-carbon:chevron-down m-1 w-6 h-6 tx-gray-500 cursor-pointer"
        @click="async () => {
          msgs.toBottom()
          await nextTick()
          if (msgEl)
            msgEl.scrollTop = msgEl.scrollHeight
        }"
      />
    </div>

    <div ref="msgEl" class="fc min-h-full pb-2 bg-sky-200 of-y-scroll">
      <div v-show="!msgs.msgs[0]?.top" ref="beforeMsgsEl" class="fn h-120vh" />
      <MsgMessage
        v-for="(msg, index) in msgs.msgs" :key="msg.id"
        :msg="msg"
        :data-msgid="msg.id"
        :first="msgs.msgs[index - 1]?.attributes.fromUserId !== msg.attributes.fromUserId"
        :last="msgs.msgs[index + 1]?.attributes.fromUserId !== msg.attributes.fromUserId"
        :show-jump="!!msgs.searchFilter"
        :highlight="msgs.highlightMsgId === msg.id"
        @jump-to="onJumpTo(msg)"
      />
      <div v-show="!msgs.msgs.at(-1)?.end" ref="afterMsgsEl" class="fn h-120vh" />
    </div>
  </div>
</template>
