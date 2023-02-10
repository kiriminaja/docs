/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './components'
    ],
    theme: {
        extend: {
        }
    },
    plugins: [
        require("@tailwindcss/typography")
    ],
}
