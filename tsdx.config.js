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
              colors: {
                'like-green': {
                  DEFAULT: '#28646e',
                },
                'like-cyan': {
                  lightest: '#d7ecec',
                  light: '#aaf1e7',
                  DEFAULT: '#50e3c2',
                },
                black: '#000',
                gray: {
                  dark: '#4a4a4a',
                  DEFAULT: '#9b9b9b',
                  light: '#ebebeb',
                  lightest: '#f7f7f7',
                },
                white: '#fff',
                red: '#e35050',
              },
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
