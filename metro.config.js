const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Поддержка .wasm для expo-sqlite на web
config.resolver.assetExts.push("wasm");

module.exports = config;
