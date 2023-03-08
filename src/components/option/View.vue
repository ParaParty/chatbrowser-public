<script lang="ts" setup>
const props = defineProps<{
  showing?: boolean
}>()
const emit = defineEmits<{
  (event: 'update:showing', value: boolean): void
}>()

const showing = useVModel(props, 'showing', emit, { passive: true })

const options = useOptions()
</script>

<template>
  <div
    class="z-50 fixed r-0 h-full transform transition-transform"
    :class="{
      'translate-x-full': !showing,
    }"
  >
    <div
      class="ab t-2 -l-10 p-1 rd-full sd-md bg-white transition-all cursor-pointer"
      @click="showing = !showing"
    >
      <div class="w-6 h-6 tx-gray-500" :class="showing ? 'i-carbon:chevron-right' : 'i-carbon:settings'" />
    </div>

    <div class="fc px-2 py-1 gap-2 w-78 h-full bd-l-1 bd-gray-300 bg-white of-y-scroll">
      <h2 class="f mt-2 px-1 ic gap-1 tx-xl">
        <div class="i-carbon:cloud text-lg" />
        网络
      </h2>

      <OptionItem>
        <input v-model="options.fetchToken" type="text" class="focus:outline-none px-1 py-px w-54 rd-md tx-center bd-1 bd-gray-300">

        <template #name>
          Token
        </template>
        <template #desc>
          (临时) 用于拉取消息的 Token
        </template>
      </OptionItem>

      <OptionItem>
        <input v-model.number="options.fetchPageSize" type="number" class="focus:outline-none px-1 py-px w-18 rd-md tx-center bd-1 bd-gray-300">

        <template #name>
          消息页大小
        </template>
        <template #desc>
          每次网络请求拉取的消息数量
        </template>
      </OptionItem>

      <OptionItem>
        <UiSelect v-model="options.imageServer" :list="{ local: '本地', cloudflare: 'Cloudflare' }" class="w-36" />

        <template #name>
          图片服务器
        </template>
        <template #desc>
          选择用于代理图片请求的服务器
        </template>
      </OptionItem>

      <h2 class="f mt-2 px-1 ic gap-1 tx-xl">
        <div class="i-carbon:chat text-lg" />
        消息
      </h2>

      <OptionItem>
        <input v-model.number="options.screenPages" type="number" class="focus:outline-none px-1 py-px w-18 rd-md tx-center bd-1 bd-gray-300">

        <template #name>
          显示页数
        </template>
        <template #desc>
          屏幕上保持的消息页数，多出会自动隐藏
        </template>
      </OptionItem>

      <OptionItem>
        <UiSwitch v-model="options.showUnsupportedCQCodes" />

        <template #name>
          显示不支持的 CQ 码
        </template>
        <template #desc>
          不支持的 CQ 码将以灰色显示
        </template>
      </OptionItem>

      <div>
        <button class="w-full p-1 rd-lg bd-1 bd-sky-300" @click="options.reset()">
          重置设置
        </button>
        <div class="tx-sm tx-center tx-gray-600 font-light">
          配置在刷新后生效
        </div>
      </div>
    </div>
  </div>
</template>
