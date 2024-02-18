/** @type {import('tailwindcss').Config} */
export default {
  purge: {
    enable: true,
    content: ["./src/**/*.jsx", "./src/**/*.html"],
  },
  important: '#root',
  content: ['./src/**/*.{js,jsx,ts,tsx}',],
  theme: {
    extend: {},
    colors: {
      'blue1': '#011140',
      'blue2': '#187CBA',
      'blue3': '#A7D5F2',
      'red': '#BF0404',
      'grey':  'grey',
      'green': '#027353',
      'white': 'whitesmoke',
      'light': "rgb(226, 226, 226)",
      'ligther': "#f1f1f1",
      'black': '#000000',
      'dark': '#202020',
      'orange': '#b65200',

    }
  }
}
  

