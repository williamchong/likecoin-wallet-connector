const path = require('path');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

module.exports = {
  rollup(config) {
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
          tailwindcss({
            content: ['./src/**/*.{ts,tsx}'],
            theme: {
              extend: {},
            },
            plugins: [],
            prefix: 'lk-',
          }),
        ],
        inject: false,
        extract: path.resolve('dist/style.css'),
      })
    );
    return config;
  },
};
