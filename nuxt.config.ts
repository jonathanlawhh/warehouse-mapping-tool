// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false, // 3D app relies heavily on client-side logic
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(
          vuetify({
            autoImport: true,
            styles: { configFile: '/assets/scss/settings.scss' }
          })
        )
      })
    },
    //...
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  app: {
    head: {
      title: 'Warehouse Mapping Tool',
      meta: [
        { name: 'description', content: 'Warehouse digital twin. Visualize storage mapping. If you still do not understand, most probably this tool is not for you.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap' }
      ]
    }
  },
  css: [
    '~/assets/scss/main.scss',
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
  ],
})
