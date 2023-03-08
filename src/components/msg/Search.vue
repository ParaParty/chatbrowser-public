<script lang="ts" setup>
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import PinIn, { CachedSearcher, SearchLogicContain, defaultDict } from 'pinin'
import type { SearchFilter, StoredUserInfo } from '@/store/msg'

const msgs = useMsgs()
const { height: innerHeight } = useWindowSize()

const input = $ref('')

const pinin = new PinIn({
  dict: defaultDict,
  fuzzy: [
    'sh|s',
    'ch|c',
    'zh|z',
    'u|v',
    'ang|an',
    'eng|en',
    'ing|in',
    'an>a',
    'ang>a',
    'ai>a',
    'ao>a',
    'ou>o',
    'ong>o',
    'en>e',
    'eng>e',
    'ei>e',
    'er>e',
    'er>r',
    'ui>u',
    'un>u',
    'vn>v',
  ],
})
const searcher = $computed(() => {
  const s = new CachedSearcher<StoredUserInfo>(SearchLogicContain, pinin)

  for (const c of msgs.users.values()) {
    s.put(c.id, c)
    if (c.nick)
      s.put(c.nick.toLowerCase(), c)
    if (c.displayName)
      s.put(c.displayName.toLowerCase(), c)
  }

  return s
})
const matchedUsers = $computed(() => {
  if (input[0] !== '@')
    return []
  const keyword = input.slice(1)
  if (!keyword) {
    const res = [...msgs.users.values()]
      .map(u => ({
        id: u.id,
        display: [{
          highlight: false,
          value: u.displayName || u.nick,
        }],
        name: u.displayName || u.nick,
        matchId: [{
          highlight: false,
          value: u.id,
        }],
        last: false,
      }))
    res[res.length - 1].last = true
    return res
  }
  const res = [...new Set(searcher.search(keyword.toLowerCase()))]
    .map((r) => {
      const matchIndices = (text: string) => {
        const res: {
          highlight: boolean
          value: string
        }[] = []
        let index = 0
        for (const match of text.matchAll(new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'))) {
          res.push({ highlight: false, value: text.slice(index, match.index) })
          res.push({ highlight: true, value: match[0] })
          index = match.index! + match[0].length
        }
        res.push({ highlight: false, value: text.slice(index) })
        return res
      }
      const nick = matchIndices(r.nick)
      const displayName = matchIndices(r.displayName)
      const matchId = matchIndices(r.id)

      return {
        id: r.id,
        display: displayName.length > 1 ? displayName : nick,
        name: r.displayName || r.nick,
        matchId,
        last: false,
      }
    })
  if (res.length)
    res[res.length - 1].last = true
  return res
})

// 选项
const encodeItem = (item: SearchFilter | undefined) => {
  if (item === undefined)
    return undefined
  return JSON.stringify(item)
}
const decodeItem = (item: string | null | undefined): SearchFilter | undefined => {
  if (!item)
    return undefined
  return JSON.parse(item)
}

// 选中结果
let selectedItemRaw = $ref<string | undefined>()
const selectedItem = $computed(() => decodeItem(selectedItemRaw))

// 选中搜索结果
const { pause, resume } = watchPausable($$(selectedItem), (item) => {
  // 清空一下 input
  pause()
  selectedItemRaw = undefined
  resume()

  if (item === undefined)
    return

  if (msgs.highlightMsgId)
    msgs.highlightMsgId = undefined
  msgs.searchFilters.push(item)
})
</script>

<template>
  <div class="f px-2 gap-2 bg-white">
    <div class="fa py-1">
      <!-- Search Filters -->
      <div class="fw gap-1">
        <div
          v-if="msgs.highlightMsgId"
          class="inline-flex mb-1 px-2 ic gap-1 rd-full bd-1 bd-sky-300 cursor-pointer"
          @click="msgs.highlightMsgId = undefined"
        >
          <div class="i-carbon:search-locate cursor-pointer" />
          重新搜索
        </div>
        <div v-for="filter in msgs.searchFilters" :key="filter.filter" class="inline-flex mb-1 pr-1 ic gap-1 rd-full bg-sky-50 bd-1 bd-sky-300">
          <template v-if="filter.type === 'fromUser'">
            <div class="inline-flex pl-px ic">
              <img class="mr-1 w-7 h-7 rd-full" :src="`https://q1.qlogo.cn/g?b=qq&nk=${filter.userId}&s=40`">
              {{ filter.userName }}
            </div>
          </template>
          <template v-else-if="filter.type === 'keyword'">
            <div class="pl-2 py-px align-middle">
              {{ filter.keyword }}
            </div>
          </template>
          <div class="i-carbon:close cursor-pointer" @click="msgs.searchFilters.splice(msgs.searchFilters.indexOf(filter), 1)" />
        </div>
      </div>

      <!-- Input -->
      <Combobox v-model="selectedItemRaw" as="div" nullable class="relative w-full">
        <ComboboxInput
          class="focus:outline-none px-1 py-px w-full rd-none bd-b-1 bd-gray-300"
          placeholder="输入文字搜索内容，输入@搜索发言人，按回车添加"
          :display-value="() => ''"
          @change="(e: Event) => input = (e.target as HTMLInputElement).value"
        />

        <Transition
          enter-active-class="transform transition duration-100 ease-out"
          enter-from-class="scale-95 -translate-1/20 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transform transition duration-96 ease-out"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 -translate-1/20 opacity-0"
        >
          <ComboboxOptions class="z-100 absolute -top-1 w-full max-w-108 rounded-lg ring-1 ring-sky-300 bg-white -translate-y-full">
            <div
              v-if="!input"
              class="px-2 py-2 w-full text-center text-gray-400"
            >
              输入一个关键词搜索
            </div>

            <template v-if="input.length > 0">
              <ComboboxOption
                v-if="/^@\d*/.test(input)"
                v-slot="{ active }"
                as="template"
                :value="encodeItem({
                  type: 'fromUser',
                  userId: input.slice(1),
                  filter: `equals(fromUserId,'${input.slice(1).replace(/'/g, '\'\'')}')`,
                })"
              >
                <li
                  class="px-2 py-1 w-full border-b border-sky-200 last:border-b-0 transition-colors duration-75 cursor-pointer"
                  :class="{ 'bg-sky-200 bg-opacity-10': active }"
                >
                  <div class="truncate">
                    <span class="i-carbon:user-avatar inline-block mr-px text-sky-600 text-sm transform translate-y-0.5" />
                    <span
                      class="transition-colors duration-75"
                      :class="{ 'text-sky-500': active }"
                    >
                      {{ input }}
                    </span>
                  </div>
                </li>
              </ComboboxOption>

              <ComboboxOption
                v-else
                v-slot="{ active }"
                as="template"
                :value="encodeItem({
                  type: 'keyword',
                  keyword: input.replace(/^\\@/, '@'),
                  filter: `contains(content,'${input.replace(/'/g, '\'\'').replace(/^\\@/, '@')}')`,
                })"
              >
                <li
                  class="px-2 py-1 w-full border-b border-sky-200 last:border-b-0 transition-colors duration-75 cursor-pointer"
                  :class="{ 'bg-sky-200 bg-opacity-10': active }"
                >
                  <div class="truncate">
                    <span class="i-carbon:search inline-block mr-px text-sky-600 text-sm transform translate-y-0.5" />
                    <span
                      class="transition-colors duration-75"
                      :class="{ 'text-sky-500': active }"
                    >
                      {{ input.replace(/^\\@/, '@') }}
                    </span>
                  </div>
                </li>
              </ComboboxOption>
            </template>

            <UseVirtualList
              v-if="matchedUsers.length"
              v-slot="{ data: user }"
              :list="matchedUsers"
              :options="{ itemHeight: 33, overscan: 15 }"
              :height="`${Math.min(innerHeight * 0.8, 350)}px`"
            >
              <ComboboxOption
                v-slot="{ active }"
                as="template"
                :value="encodeItem({
                  type: 'fromUser',
                  userId: user.id,
                  userName: user.name,
                  filter: `equals(fromUserId,'${user.id.replace(/'/g, '\'\'')}')`,
                })"
              >
                <li
                  class="f px-2 py-1 w-full ic transition-colors duration-75 cursor-pointer"
                  :class="{ 'bg-sky-200 bg-opacity-10': active, 'border-b border-sky-200': !user.last }"
                >
                  <img class="mr-1 w-6 h-6 rd-full" :src="`https://q1.qlogo.cn/g?b=qq&nk=${user.id}&s=40`">

                  <div class="truncate transition-colors duration-75" :class="{ 'text-sky-500': active }">
                    <span
                      v-for="(block, index) in user.display" :key="index"
                      :class="{ 'font-semibold': block.highlight }"
                    >{{ block.value }}</span>
                  </div>

                  <div class="ml-auto tx-sm tx-gray-400">
                    <span
                      v-for="(block, index) in user.matchId" :key="index"
                      :class="{ 'tx-gray-500': block.highlight }"
                    >{{ block.value }}</span>
                  </div>
                </li>
              </ComboboxOption>
            </UseVirtualList>
          </ComboboxOptions>
        </Transition>
      </Combobox>
    </div>
  </div>
</template>
