const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro cache'i devre dışı bırak
config.cacheStores = [];

// Cache'i tamamen devre dışı bırak
config.resetCache = true;

module.exports = config;