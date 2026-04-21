// PostCSS config — PurgeCSS is intentionally NOT active here.
// Hugo's css.PostCSS + PurgeCSS-as-plugin does not purge correctly
// when CSS is piped via stdin (v6 bug). PurgeCSS runs as a separate
// CLI step in the build script instead (see package.json).
module.exports = {
  plugins: [],
};
