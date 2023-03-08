export const useImageCache = defineStore('image-cache', () => {
  const dims = reactive<Map<string, string>>(new Map())

  return {
    dims,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useImageCache, import.meta.hot))
