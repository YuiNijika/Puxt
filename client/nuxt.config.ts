// https://nuxt.com/docs/api/configuration/nuxt-config
const baseUrl = 'https://puxt-server.x-x.work/api';
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  build: {
    transpile: [
      'vueuse'
    ],
  },
  modules: [
    '@nuxtjs/seo',
    '@nuxt/ui',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],

  ui: {
    fonts: false
  },
  colorMode: {
    preference: 'dark'
  },

  nitro: {
    devProxy: {
      "/apiService": {
        target: baseUrl,
        changeOrigin: true,
        prependPath: true,
      },
    },
    routeRules: {
      '/apiService/**': {
        proxy: `${baseUrl}/**`
      }
    }
  },

  css: [
    '~/assets/main.css',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      title: 'Puxt',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
      ],
    }
  },
})