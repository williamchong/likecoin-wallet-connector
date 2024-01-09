export default defineNuxtConfig({
  target: 'static',
  // Global page headers: https://go.nuxtjs.dev/config-head
  meta: {
    title: 'LikeCoin Wallet Connector Example',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '../dist/style.css',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@invictus.codes/nuxt-vuetify',
  ],
});
