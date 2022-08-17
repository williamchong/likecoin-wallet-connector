const path = require('path');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          tailwindcss({
            content: ['./src/**/*.{ts,tsx}'],
            theme: {
              extend: {},
            },
            plugins: [],
            prefix: 'lk-',
          }),
          autoprefixer(),
        ],
        minimize: !!options.minify || options.env === 'production',
        inject: false,
        extract: path.resolve('dist/style.css'),
      })
    );
    return config;
  },
};
