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
            dir: '/content',
            root: '/content',
            edit: true,
            releases: true,
            owner: 'kiriminaja',
            repo: 'docs',
            branch: 'main'
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
