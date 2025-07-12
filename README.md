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

## 🛠 Speckle 自定义 Loader 实践指南

### 1. 四大核心组件缺一不可

- **SpeckleGeometryConverter**  
  负责将 Speckle 对象递归转换为可渲染的 Three.js（或其他后端）几何体。

- **SpeckleLoader**  
  Loader 的基类，负责资源加载、树结构管理、生命周期等。自定义 Loader 必须继承它。

- **SpeckleObject**  
  所有 Speckle 数据的基类，递归遍历和数据结构的基础。

- **WorldTree**  
  场景树，负责管理所有加载到 Viewer 的对象。Loader 必须把解析后的对象挂载到 WorldTree。

### 2. Speckle 对象结构与 displayValue 详解

#### 2.1 有向无环图 (DAG) 结构
Speckle 使用有向无环图 (DAG) 来管理对象，确保：
- **效率**：避免循环依赖，确保高效的数据存储和检索
- **非冗余**：对象可以在图中重复使用而不重复，减少数据冗余
- **清晰性**：层次结构使不同对象之间的关系更容易理解

#### 2.2 Definition 和 Instance 对象
Speckle 通过 Definition 和 Instance 对象管理可重用组件：

- **Definition**：作为可重用组件的模板，如窗户或门，在模型中多次出现
- **Instance**：表示已定义组件的每次出现，包括指定位置、旋转和缩放的变换矩阵

#### 2.3 displayValue 属性的真正含义
根据 [Speckle Community 的详细阐述](https://speckle.community/t/how-to-covert-an-assembly-with-re-used-instances-to-speckle/12583/2)：

> **重要理解**：`displayValue` 属性是一个包含网格列表的属性，代表对象的视觉方面。这允许组件具有灵活和详细的表示，而无需在每个级别都进行变换。

**关键要点**：
- `displayValue` 是**所有 Speckle 对象**都可以包含的属性
- 它是一个**网格列表**，代表对象的视觉表现
- 它允许对象具有灵活和详细的视觉表示
- 它避免了在每个节点都应用变换的复杂性

#### 2.4 Collection 和层次组织
Speckle 使用 `Collection` 对象来分组相关元素，支持：
- **模块化设计**：通过分组相关组件，鼓励模块化的模型设计方法
- **可重用性**：定义一次的组件可以在模型的不同部分重复使用

### 3. 典型自定义 Loader 代码结构

```typescript
import {
  SpeckleGeometryConverter,
  SpeckleLoader,
  SpeckleObject,
  WorldTree,
} from '@speckle/viewer';

export class SpeckleJSONObjectLoader extends SpeckleLoader {
  constructor(targetTree: WorldTree, resourceData?: string | ArrayBuffer) {
    super(targetTree, 'dummy-url', undefined, false, resourceData);
  }
  public async load(): Promise<boolean> {
    const parsedObj = JSON.parse(this._resourceData as string);
    await (this as any).converter.traverse(
      this._resource,
      parsedObj as SpeckleObject,
      async () => { /* ... */ }
    );
    const geometryConverter = new SpeckleGeometryConverter();
    const renderTree = (this as any).tree.getRenderTree(this._resource);
    if (!renderTree) return false;
    await renderTree.buildRenderTree(geometryConverter);
    return true;
  }
}
```

### 4. 常见错误与排查

- **结构不规范**：必须有 Base 和 @displayValue
- **缺少四大核心组件**：Loader 只用其一会导致渲染失败
- **自定义字段无效**：Loader 只认 Speckle 标准字段
- **displayValue 理解错误**：它不是 Base 对象的专属属性，而是所有 Speckle 对象都可以包含的视觉表现属性

---

> **最佳实践**：理解 displayValue 是所有 Speckle 对象的通用视觉属性，而不仅仅是 Base 对象的专属。正确使用 Definition/Instance 模式来管理可重用组件。

---

## 参考资料

- [Generating a Surface from Scratch, specklePy - Speckle Community](https://speckle.community/t/generating-a-surface-from-scratch-specklepy/16225/6)

该帖子详细讨论了如何用 Speckle 标准结构生成几何体、Base、@displayValue 等关键点，是理解和实现自定义 Loader 的重要参考。

- [How to convert an Assembly with re-used instances to Speckle - Speckle Community](https://speckle.community/t/how-to-covert-an-assembly-with-re-used-instances-to-speckle/12583/2)

这篇重要文章详细阐述了 Speckle 的 DAG 结构、Definition/Instance 模式，以及 displayValue 属性的真正含义。纠正了 displayValue 是 Base 对象专属属性的错误理解，明确了它是所有 Speckle 对象都可以包含的视觉表现属性。