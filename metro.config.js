const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// pnpm 虚拟存储路径 — 让 Metro 能访问到真实的 package.json
const pnpmStore = path.resolve(__dirname, 'node_modules/.pnpm');

config.watchFolders = [path.resolve(__dirname), pnpmStore];

// 强制优先使用 react-native 字段，确保加载 .native.ts 等平台专用入口
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 把 pnpm 虚拟存储加入模块解析路径，避免错误回退到 main 字段
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  pnpmStore,
];

module.exports = config;
