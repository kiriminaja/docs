// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    extends: '@nuxt-themes/docus',
    colorMode: {
        preference: 'dark',
    },
    css: [
        '~/assets/main.css'
    ],
    runtimeConfig: {
        public: {
            algolia: {
                // @ts-ignore
                applicationId: process.env.ALGOLIA_APP_ID ?? '',
                // @ts-ignore
                apiKey: process.env.ALGOLIA_APP_KEY ?? '',
                langAttribute: 'lang',
                docSearch: {
                    // @ts-ignore
                    indexName: process.env.ALGOLIA_INDEX_NAME ?? ''
                }
            }
        }
    }
})
