# Speckle OBJ Loader Project

这是一个使用 Speckle Viewer + Tweakpane 加载和编辑 OBJ 文件、CSV/Excel 数据的项目，支持标准 Speckle 对象（Point/Line/Box）的创建、批量导入、属性编辑与导出。

## 🎯 核心功能

### 1. OBJ 文件加载
使用 Speckle 官方的 `ObjLoader` 加载标准的 OBJ 文件：
```typescript
const objLoader = new ObjLoader(viewer.getWorldTree(), '/triangle.obj');
await viewer.loadObject(objLoader, true);
```

### 2. CSV/Excel 数据加载与批量导入
支持如下 CSV 格式，自动识别 type 字段（Point/Line/Box）：
```csv
speckle_type,x,y,z,units,color,x1,y1,z1,x2,y2,z2,width,height,depth
Point,1,2,3,m,#ff0000
Line,0,0,0,m,#00ff00,0,0,0,1,1,1
Box,0,0,0,m,#0000ff,,,,,,,2,2,2
```

使用方法：
- 在 Tweakpane 面板点击"批量导入"，粘贴 CSV 数据即可。
- 支持多类型混合导入。

### 3. Tweakpane 高级 UI
- 支持通过 UI 面板动态添加 Point/Line/Box。
- 支持属性实时编辑，选中对象后可直接在面板下方修改参数。
- 支持导出当前所有几何体为 JSON。
- 支持清空选中、批量导入、导出等操作。

### 4. 场景与渲染
- 所有对象均通过 CsvLoader 渲染到 Three.js 场景，自动设置到 PROPS 层，支持颜色、单位等属性。
- 支持与 Speckle Viewer 场景实时联动。

## 🔑 技术要点

- 只保留 Speckle 标准对象（Point/Line/Box）主流程。
- 所有几何体对象均通过 UI 或批量导入直接 new 出来，无需额外生成器或解析器。
- 代码结构极为简洁，便于维护和扩展。

## 🚀 如何运行

1. **安装依赖**：
   ```bash
   npm install
   ```
2. **启动开发服务器**：
   ```bash
   npm run dev
   ```
3. **访问浏览器**：
   打开浏览器中显示的本地 URL

## 📖 参考文档
- [Speckle Viewer 加载器文档](https://speckle.guide/viewer/loaders.html)
- [Speckle Viewer 高级设置](https://speckle.guide/viewer/advanced-setup.html)
- [Speckle Core 2.0: The Base Object](https://speckle.community/t/core-2-0-the-base-object/782)
- [Three.js 官方文档](https://threejs.org/docs/)

## ⚠️ 注意事项
- 场景为空时，Speckle Viewer 相机无法自动缩放，请至少添加一个几何体。
- 所有自定义对象必须设置到 PROPS 层，避免渲染冲突。
- 仅支持 Point/Line/Box 三类 Speckle 标准对象。