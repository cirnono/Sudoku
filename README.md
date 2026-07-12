# 纯净数独

[简体中文](README.md) | [English](README.en.md)

一款使用 Expo、React Native 和 TypeScript 开发的纯净数独应用，专注于清晰的盘面、快捷输入和舒适的解题体验。

## 功能

- 六档难度：简单、中等、困难、专家、大师、极限
- 题目生成时检查唯一解
- 普通输入与“先选数字、再点格子”的快速模式
- 铅笔候选数与全盘候选数开关
- 同行、同列、同宫、相同数字及候选数字高亮
- 海洋蓝、森林绿、日落橙、薰衣紫、樱花粉五套高亮配色
- 撤销、擦除、暂停、新局和重玩
- 自动保存当前进度
- 当前局内的手动存档与读档，方便尝试不同解法
- 持久保存难度、配色和快速模式设置

## 技术栈

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Zustand
- AsyncStorage
- pnpm

## 开始使用

需要先安装 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。在手机上测试时，请安装支持 Expo SDK 54 的最新版 Expo Go。

```bash
pnpm install
pnpm start
```

启动后使用 Expo Go 扫描终端中的二维码。也可以运行：

```bash
pnpm android
pnpm ios
pnpm web
```

> iOS 模拟器需要 macOS；Android 模拟器需要提前配置 Android Studio。

## 操作说明

- 点击左上角难度可选择难度，选择后会立即开始新局。
- 开启快速模式后，先选择底部数字，再点击格子即可连续填写。
- 开启铅笔模式后，输入的数字会作为候选数记录。
- 候选开关可以自动生成或清除当前盘面的候选数。
- “存档”保存当前局的测试状态，“读档”恢复该状态；进入新局或完成题目后，测试存档会自动清除。
- 点击右上角“配色”可以切换整套高亮颜色。

## 项目结构

```text
src/
├── components/   # 棋盘、格子、操作栏和数字键盘
├── logic/        # 数独生成、求解与校验
├── screens/      # 游戏页面
├── store/        # Zustand 游戏状态
├── theme/        # 高亮配色
├── types/        # TypeScript 类型
└── utils/        # 本地存储
```

## 检查与构建

```bash
# TypeScript 检查
pnpm exec tsc --noEmit

# 验证 Android JavaScript Bundle
pnpm exec expo export --platform android
```

## License

本项目采用 [MIT License](LICENSE)，允许复制、修改与分发，但需保留原版权和许可声明。
