<script lang="ts" setup>
import type { Zoom } from 'medium-zoom'

defineProps<{
  html: string
}>()

const mediumZoom = inject<Zoom>('mediumZoom')

const el = $shallowRef<HTMLDivElement>()

onMounted(() => {
  mediumZoom?.attach(el.querySelectorAll('img[data-zoomable]'))
})
onBeforeUnmount(() => {
  mediumZoom?.detach(el.querySelectorAll('img[data-zoomable]'))
})
</script>

<template>
  <p ref="el" v-html="html" />
</template>
