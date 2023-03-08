/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  VITE_BACKEND_BASE: string
}

declare module 'virtual:cq-faces.js' {
  const faces: Record<string, string>
  export default faces
}
