export default defineAppConfig({
  docus: {
    title: 'KiriminAja Developer',
    description: 'Develop. Connect. Shipped. Tenang Pakai #KiriminAja',
    image: '/cover.png',
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
      logo: true,
      showLinkIcon: true,
      exclude: []
    },
    footer: {
      credits: {
        icon: '',
        text: '© Powered by KiriminAja Tech',
        href: 'https://instagram.com/kiriminaja.it',
      }
    }
  }
})
