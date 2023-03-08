export const useOptions = defineStore('options', () => {
  // options
  const fetchToken = useLocalStorage('fetchToken', '', { writeDefaults: false })
  const fetchPageSize = useLocalStorage('fetchPageSize', 40, { writeDefaults: false })
  const imageServer = useLocalStorage('imageServer', 'cloudflare', { writeDefaults: false })

  const screenPages = useLocalStorage('screenPages', 5, { writeDefaults: false })
  const showUnsupportedCQCodes = useLocalStorage('showUnsupportedCQCodes', true, { writeDefaults: false })

  // helpers
  const screenPageSize = computed(() => fetchPageSize.value * screenPages.value)

  const getImageUrl = (file: string, url: string, width?: number, height?: number) => {
    switch (imageServer.value) {
      case 'local':
        return url.replace(/^https:\/\/([^\/]+)\.qpic\.cn\/(.+)/, '/proxy/qpic/$1/$2')
      case 'cloudflare':
        return url.replace(/^https:\/\/([^\/]+)\.qpic\.cn\/(.+)/, '/proxy/qpic/$1/$2')
      default:
        return url.replace(/^https:\/\/([^\/]+)\.qpic\.cn\/(.+)/, '/proxy/qpic/$1/$2')
    }
  }

  const reset = () => {
    fetchToken.value = ''
    fetchPageSize.value = 50
    imageServer.value = 'cloudflare'
    screenPages.value = 3
  }

  return {
    fetchToken,
    fetchPageSize,
    imageServer,
    screenPages,
    showUnsupportedCQCodes,

    screenPageSize,

    getImageUrl,

    reset,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useOptions, import.meta.hot))
