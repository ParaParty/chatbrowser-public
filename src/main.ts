import { Suspense, createApp, defineComponent, h } from 'vue'
import mediumZoom from 'medium-zoom'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import '@/styles/index.css'

const AppRoot = defineComponent({
  setup() {
    provide('mediumZoom', mediumZoom())
  },
  render: () => h(Suspense, {}, { default: h(App) }),
})

const app = createApp(AppRoot)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')
