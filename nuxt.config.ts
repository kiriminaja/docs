// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  colorMode: {
    preference: 'dark',
  },
  modules: ['@nuxtjs/tailwindcss']
})
