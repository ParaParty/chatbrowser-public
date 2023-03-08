import fs from 'fs/promises'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import components from 'unplugin-vue-components/vite'
import { VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'
import autoImport from 'unplugin-auto-import/vite'
import inspect from 'vite-plugin-inspect'
import { createProxyServer } from 'http-proxy'

/**
 * Vite Configuration File
 *
 * Docs: https://vitejs.dev/config/
 */
export default defineConfig({
  server: {
    proxy: {
      '/proxy/api': {
        target: '某个兼容 JsonApi.net 协议的服务端 EndPoint',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    vue({
      reactivityTransform: true,
    }),
    autoImport({
      imports: [
        'vue',
        'vue/macros',
        'pinia',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: [
        'src/composables',
        'src/store',
      ],
      vueTemplate: true,
    }),
    components({
      resolvers: [VueUseComponentsResolver()],
      dts: 'src/components.d.ts',
      directoryAsNamespace: true,
    }),
    unocss(),
    {
      name: 'custom:proxy',
      configureServer(server) {
        const proxy = createProxyServer()
        server.middlewares.use('/proxy/qpic', (req, res, next) => {
          const [, host, path] = req.url!.match(/^\/([^\/]+)\/(.*)$/)!
          req.url = path
          delete req.headers.referer
          proxy.web(req, res, {
            target: `https://${host}.qpic.cn`,
            changeOrigin: true,
          }, next)
        })
      },
    },
    {
      name: 'custom:cq-faces',
      resolveId(id) {
        if (id === 'virtual:cq-faces.js')
          return '\0cq-faces.js'
      },
      async load(id) {
        if (id === '\0cq-faces.js') {
          const files = await fs.readdir(path.resolve(__dirname, 'public/static/CQ/face'))
          return `export default ${JSON.stringify(Object.fromEntries(
            files.map(name => [name.match(/^(\d+)\..+$/)![1], `/static/CQ/face/${name}`])))}`
        }
      },
    },
    inspect(),
  ],
  build: {
    sourcemap: true,
  },
  esbuild: {
    charset: 'utf8',
  },
})
