export default defineAppConfig({
  docus: {
    title: 'Docs',
    description: 'Develop. Connect. Shipped. Tenang Pakai #KiriminAja',
    image: '/cover.png',
    socials: {
      github: 'kiriminaja',
      instagram: 'kiriminaja.it'
    },
    github: {
      root: 'content',
      edit: true,
      contributors: false
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
