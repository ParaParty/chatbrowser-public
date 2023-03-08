<script lang="ts" setup>
import type { StoredMsg } from '@/store/msg'

const {
  msg,
} = defineProps<{
  msg: StoredMsg
  first: boolean
  last: boolean
  showJump: boolean
  highlight: boolean
}>()
const emit = defineEmits<{
  (event: 'jumpTo'): void
}>()

const wrapWidthEl = shallowRef<HTMLDivElement>()
const contentEl = shallowRef<HTMLParagraphElement>()
const dateEl = shallowRef<HTMLDivElement>()

const { width: wrapWidth } = useElementSize(wrapWidthEl)
const { width: contentWidth } = useElementSize(contentEl)
const { width: dateWidth } = useElementSize(dateEl)

const nickColors = [
  {
    name: 'tx-emerald-500',
    nick: 'tx-emerald-400',
  },
  {
    name: 'tx-lime-500',
    nick: 'tx-lime-400',
  },
  {
    name: 'tx-pink-500',
    nick: 'tx-pink-400',
  },
  {
    name: 'tx-orange-500',
    nick: 'tx-orange-400',
  },
  {
    name: 'tx-cyan-500',
    nick: 'tx-cyan-400',
  },
  {
    name: 'tx-violet-500',
    nick: 'tx-violet-400',
  },
]
const nickColor = $computed(() => nickColors[parseInt(msg.attributes.fromUserId) % nickColors.length])

const imageOnly = $computed(() => msg.attributes.content.match(/^\[CQ:image,[^\]]+\]$/))

const timeWrap = $computed(() => contentWidth.value + dateWidth.value + 8 >= wrapWidth.value)
const timeOut = $computed(() => contentWidth.value < dateWidth.value + 8)
</script>

<template>
  <div
    class="f ml-2 ie gap-1"
    :class="{ 'mt-2': first, 'mt-.5': !first }"
  >
    <img v-if="last" class="w-8 h-8 rd-full" :src="`https://q1.qlogo.cn/g?b=qq&nk=${msg.attributes.fromUserId}&s=40`">
    <div v-else class="w-8" />

    <div
      class="fc gap-px rd-md shadow bg-white"
      :class="{
        'px-2 py-1': !imageOnly,
        'rd-bl-none': last,
        'max-w-[min(calc(100vw-5rem),56ch)]': showJump,
        'max-w-[min(calc(100vw-3.5rem),56ch)]': !showJump,
        'ring-2 ring-amber-300': highlight,
      }"
    >
      <div
        v-if="first"
        class="f jb gap-2 tx-sm"
        :class="{
          'px-2 pt-1': first && imageOnly,
        }"
        :style="{
          maxWidth: imageOnly ? `${contentWidth}px` : undefined,
        }"
      >
        <div class="f min-w-0 gap-1">
          <span class="truncate" :class="nickColor.name">
            {{ msg.attributes.fromUserInfo.displayName || msg.attributes.fromUserInfo.nick }}
          </span>
          <span
            v-if="msg.attributes.fromUserInfo.displayName
              && msg.attributes.fromUserInfo.displayName !== msg.attributes.fromUserInfo.nick"
            class="f1 truncate" :class="nickColor.nick"
          >
            ({{ msg.attributes.fromUserInfo.nick }})
          </span>
        </div>
        <div class="f1 je f min-w-0">
          <span class="tx-gray-400 truncate">{{ msg.attributes.fromUserId }}</span>
        </div>
      </div>

      <div
        class="re gap-x-2"
        :class="{ 'fc': timeWrap, 'f jb ie': !timeWrap }"
      >
        <div ref="wrapWidthEl" class="ab w-[min(calc(100vw-6rem),54ch)] h-0 op-0" />
        <div
          ref="contentEl"
          class="whitespace-pre-wrap break-all"
          :class="{
            'rd-md of-hidden': imageOnly,
            'rd-bl-none': last,
            'rd-t-none': first,
          }"
        >
          <MsgContent :html="msg.html" />
        </div>
        <div
          ref="dateEl"
          class="ml-auto tx-xs tx-gray-400 whitespace-nowrap"
          :class="{
            'ab px-1 py-.5 rd tx-white bg-black/30': imageOnly,
            'r-.5 b-.5': !timeOut,
            'l-[calc(100%+.25rem)] b-0': timeOut,
          }"
        >
          {{ formatRelative(new Date(msg.attributes.sendTime)) }}
        </div>
      </div>
    </div>

    <div v-if="showJump" class="rd-full bg-black/25 cursor-pointer" @click="emit('jumpTo')">
      <div class="i-carbon:arrow-right m-1 w-4 h-4 tx-white" />
    </div>
  </div>
</template>
