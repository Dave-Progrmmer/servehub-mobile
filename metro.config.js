const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable production mode optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      // Remove console.logs in production
      drop_console: true,
      // Remove debugger statements
      drop_debugger: true,
    },
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;