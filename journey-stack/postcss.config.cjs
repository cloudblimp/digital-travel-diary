// Use CommonJS filename (.cjs) because the project uses "type": "module" in package.json
// PostCSS will load this file via require() and the CommonJS export will work.
// Tailwind removed — keep PostCSS with autoprefixer only.
module.exports = {
  plugins: [
    require('autoprefixer'),
  ],
};
