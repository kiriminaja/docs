export default defineAppConfig({
  docus: {
    title: 'KiriminAja Developer',
    description: 'Develop. Connect. Shipped. Tenang Pakai #KiriminAja',
    image: 'https://user-images.githubusercontent.com/904724/185365452-87b7ca7b-6030-4813-a2db-5e65c785bf88.png',
    socials: {
      github: 'kiriminaja',
      instagram: 'kiriminaja.it'
    },
    aside: {
      level: 1,
      exclude: [
          '/'
      ]
    },
    header: {
      fluid: true,
      logo: true,
      showLinkIcon: true,
      exclude: []
    },
    main: {
      fluid: true,
    },
    footer: {
      credits: {
        icon: '',
        text: '© Powered by KiriminAja Tech',
        href: 'https://instagram.com/kiriminaja.it',
      },
      fluid: true
    }
  }
})
