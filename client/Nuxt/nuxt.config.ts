// https://nuxt.com/docs/api/configuration/nuxt-config

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
    '@pinia/nuxt', 
    '@nuxt/image'
  ],

  ui: {
    fonts: false
  },
  colorMode: {
    preference: 'dark'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_URL,
    }
  },

  css: [
    '~/assets/main.css',
  ],

  app: {
    head: {
      title: 'Puxt',
      htmlAttrs: {
        lang: 'zh-CN',
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
      ],
    }
  },
})