<script lang="ts" setup>
import { Switch } from '@headlessui/vue'

const props = defineProps<{
  modelValue: boolean
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <Switch
    v-model="modelValue"
    class="focus:outline-none re inline-flex flex-shrink-0 h-5.5 w-10 rd-full sd-inner bd-1 bd-transparent transition-colors duration-200 ease-in-out cursor-pointer focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75"
    :class="{
      'bg-sky-300': !modelValue,
      'bg-sky-400': modelValue,
    }"
  >
    <span
      class="inline-block rd-full bg-white w-5 h-full sd-lg ring-0 transform transition-transform duration-200 ease-in-out pointer-events-none"
      :class="{
        'translate-x-4.5': modelValue,
      }"
    />
  </Switch>
</template>
