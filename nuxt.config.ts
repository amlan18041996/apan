// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/eslint'],
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  pinia: {
    storesDirs: ['./app/stores/**'],
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    shopifyAdminToken: '',
    typesenseHost: 'localhost',
    typesensePort: '8108',
    typesenseApiKey: '',
    typesenseProtocol: 'http',
    public: {
      shopifyStoreDomain: '',
      shopifyStorefrontToken: '',
      shopifyApiVersion: '2024-10',
      appUrl: '',
    },
  },
})
