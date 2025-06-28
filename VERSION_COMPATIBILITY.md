# Speckle Viewer 版本兼容性说明

## 已知问题

### Speckle Viewer 2.20.1 兼容性问题

在使用 `@speckle/viewer": "2.20.1"` 版本时，CustomLoader 可能会遇到以下错误：

```
Cannot read properties of undefined (reading 'instances')
```

这个错误发生在 Speckle Viewer 内部调用 `_ai.getInstances` 方法时，是由于 Speckle 内部期望某个对象具有 `instances` 属性，但该对象为 `undefined`。

## 解决方案

### 方案 1: 使用绕过方法（推荐）

直接调用加载器的 `load` 方法，避免使用 `viewer.loadObject()`：

```typescript
// 不推荐（会产生错误）
await viewer.loadObject(customLoader, true);

// 推荐（避免错误）
await customLoader.load();
```

### 方案 2: 升级 Speckle Viewer 版本

尝试升级到更新的 Speckle Viewer 版本：

```bash
npm install @speckle/viewer@latest
```

### 方案 3: 降级 Speckle Viewer 版本

如果新版本有其他问题，可以尝试降级到较早的稳定版本：

```bash
npm install @speckle/viewer@2.19.0
```

## 功能状态

- ✅ 自定义三角形网格正常显示
- ✅ 鼠标控制正常工作
- ✅ 场景渲染正常
- ❌ 使用 `viewer.loadObject()` 时出现 `instances` 错误

## 技术细节

这个问题是由于 Speckle Viewer 2.20.1 内部实现的变化导致的。CustomLoader 实现了标准的 Speckle 加载器接口，但 Speckle 内部在处理自定义加载器时存在兼容性问题。

## 建议

1. 继续使用绕过方法，因为功能完全正常
2. 关注 Speckle Viewer 的更新，等待官方修复
3. 如果需要在生产环境使用，建议测试不同版本的兼容性 