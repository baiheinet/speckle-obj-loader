# Speckle OBJ Loader Project

这是一个使用 Speckle Viewer 加载 OBJ 文件和 CSV/Excel 几何数据的项目。它包含了以下功能扩展：
- `CameraController`: 提供基本的相机轨道控制。
- `SelectionExtension`: 提供选择/悬停效果，并聚焦对象。
- `SectionTool`: 添加可自定义的剖面框。
- `SectionOutlines`: 为剖面对象添加轮廓。
- `MeasurementsExtension`: 提供测量功能。
- `FilteringExtension`: 提供过滤功能。
- `DiffExtension`: 提供差异比较功能。

## 🎯 核心功能

### 1. OBJ 文件加载
使用 Speckle 官方的 `ObjLoader` 加载标准的 OBJ 文件：
```typescript
const objLoader = new ObjLoader(viewer.getWorldTree(), '/triangle.obj');
await viewer.loadObject(objLoader, true);
```

### 2. CSV/Excel 几何体数据加载
使用自定义的 `CsvLoader` 加载 CSV/Excel 格式的几何体数据，符合 [Speckle Excel 集成标准](https://github.com/specklesystems/speckle-docs-OLD/blob/main/user/excel.md)：

#### CSV 数据格式（Excel 标准）
```csv
id,speckle_type,applicationId,name,description,vertices,faces,colors,bbox_min,bbox_max,area,volume,units,transform_matrix,material,properties
custom-mesh-1,Objects.Geometry.Mesh,custom-mesh-1,Red Triangle,First test triangle,"0,0,0,2,0,0,0,2,0","0,0,1,2","255,0,0,255,0,0,255,0,0","0,0,0","2,2,0",2.0,0.0,m,"1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1",basic,"type:test,priority:high"
```

#### 使用方法
```typescript
// 从 CSV 文件加载数据
const csvData = await loadCsvFromUrl('/geometry_data.csv');

// 验证数据格式
if (!validateCsvData(csvData)) {
  throw new Error('CSV 数据格式无效');
}

// 使用 CsvLoader 加载数据
const csvLoader = new CsvLoader(csvData, viewer.getWorldTree(), viewer);
await viewer.loadObject(csvLoader, true);
```

#### 支持的功能
- **多实例加载**：一个 CSV 文件可以包含多个几何体实例
- **顶点颜色**：支持 RGB 颜色值（0-255）
- **变换矩阵**：支持 4x4 变换矩阵进行位置、旋转、缩放
- **数据验证**：自动验证 CSV 格式和必需字段
- **错误处理**：完善的错误处理和日志记录
- **对象属性**：支持名称、描述、材质、自定义属性
- **Speckle 集成**：完全符合 Speckle Excel 集成标准

### 3. 灵活几何体生成器（Python 示例风格）
使用灵活的几何体生成器动态创建和修改几何体数据，完全模拟 [Speckle Python 示例](https://github.com/specklesystems/speckle-docs-OLD/blob/main/dev/py-sample.md) 的功能：

#### 基本使用方法
```typescript
// 创建几何体生成器实例
const generator = new GeometryGenerator();

// 设置场景配置
generator.setSceneConfig(createDefaultScene());

// 动态添加几何体
generator.addGeometry({
  type: 'triangle',
  position: [5, 0, 0],
  size: [1, 1, 0],
  color: [255, 0, 255],
  name: 'Dynamic Triangle',
  properties: { priority: 'dynamic' }
});

// 更新现有几何体
generator.updateGeometry(0, {
  type: 'triangle',
  position: [0, 0, 0],
  size: [3, 3, 0],
  color: [255, 100, 100],
  name: 'Updated Triangle'
});

// 生成并加载几何体
const generatedData = generator.generate();
const loader = new CsvLoader(generatedData, viewer.getWorldTree(), viewer);
await loader.load();
```

#### 高级功能
- **动态配置管理**：可以随时添加、删除、更新几何体配置
- **场景级属性**：支持全局属性应用到所有几何体
- **实时修改**：可以在运行时动态修改几何体
- **批量操作**：支持批量添加和修改几何体
- **配置持久化**：可以保存和恢复场景配置

#### 支持的几何体类型
- **三角形** (`triangle`)：支持位置、大小、颜色配置
- **矩形** (`rectangle`)：支持位置、大小、颜色配置
- **立方体** (`cube`)：支持位置、大小、颜色、材质配置
- **圆形** (`circle`)：支持位置、半径、颜色、材质配置

#### 配置选项
```typescript
interface GeometryConfig {
  type: 'triangle' | 'rectangle' | 'circle' | 'cube';
  position: [number, number, number];  // 位置坐标
  size: [number, number, number];      // 尺寸
  color: [number, number, number];     // RGB 颜色
  name?: string;                       // 几何体名称
  description?: string;                // 描述
  properties?: Record<string, string>; // 自定义属性
  material?: string;                   // 材质类型
  transform?: number[];                // 变换矩阵
}
```

### 4. 传统 JSON 数据加载
使用自定义的 `CustomLoader` 加载 JSON 格式的几何数据：

#### 数据结构
```json
{
  "id": "test-mesh",
  "speckle_type": "Objects.Geometry.Mesh",
  "vertices": [0, 0, 0, 1, 0, 0, 0, 1, 0],
  "faces": [0, 0, 1, 2],
  "colors": [255, 0, 0, 255, 0, 0, 255, 0, 0]
}
```

#### 使用方法
```typescript
const customLoader = new CustomLoader(customObjectData, viewer.getWorldTree(), viewer);
await customLoader.load();
```

## 🔑 关键技术要点

### 1. 图层设置（重要！）
当在 Speckle viewer 中显示自定义 Three.js 几何体时，必须设置到 PROPS 层：
```typescript
mesh.layers.set(ObjectLayers.PROPS);
```

**作用**：
- 避免 Speckle 内部渲染流程干扰
- 让 Three.js 直接渲染，不受 WorldTree 和 RenderTree 影响
- 防止与 Speckle 原生对象产生渲染冲突

### 2. 面格式转换
Speckle 使用特殊的面格式，需要转换为 Three.js 索引：
```typescript
// Speckle 格式: [0, 0, 1, 2] 表示 3 个顶点的面
const indices = [];
for (let i = 0; i < faces.length; i += 4) {
  indices.push(faces[i + 1], faces[i + 2], faces[i + 3]);
}
geometry.setIndex(indices);
```

### 3. 顶点颜色处理
支持顶点颜色，需要转换为 0-1 范围：
```typescript
const colors = new Float32Array(meshData.colors.map((c: number) => c / 255));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
```

## 📋 Speckle 2.0 基础对象结构

基于 [Speckle Core 2.0 文档](https://speckle.community/t/core-2-0-the-base-object/782)，Speckle 2.0 的基础对象设计有了重要改进：

### 基础对象属性
```typescript
{
  id: string,              // 对象的唯一哈希标识符
  applicationId: string,   // 可选的次要身份标识
  speckle_type: string     // 对象类型标识符（由系统自动设置）
}
```

### 重要特性
1. **动态属性支持** - 可以像 JavaScript 对象一样添加任意属性
2. **强类型继承** - 可以继承 Base 类并定义强类型属性
3. **不可变性** - 对象一旦创建就不可变，修改会生成新对象
4. **自动哈希** - 系统自动处理对象哈希，无需手动管理

### 数据结构示例
```typescript
// 简单几何体对象
const meshObject = {
  id: "unique-hash-here",
  speckle_type: "Objects.Geometry.Mesh",
  applicationId: "my-mesh-001",
  vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0],
  faces: [0, 0, 1, 2],
  colors: [255, 0, 0, 255, 0, 0, 255, 0, 0]
};

// 复杂对象结构（支持嵌套）
const complexObject = {
  id: "complex-object-hash",
  speckle_type: "Objects.Other.BlockInstance",
  applicationId: "building-element-001",
  definition: {
    speckle_type: "Objects.Other.BlockDefinition",
    displayValue: [
      {
        speckle_type: "Objects.Geometry.Mesh",
        vertices: [...],
        faces: [...]
      }
    ]
  },
  instances: [
    {
      speckle_type: "Objects.Other.Transform",
      transform: {
        matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      }
    }
  ]
};
```

## 📁 项目结构

```
speckle-obj-loader/
├── src/
│   ├── CustomLoader.ts      # 自定义几何体加载器
│   ├── main.ts             # 主入口文件
│   ├── data/
│   │   └── customObject.json # 自定义几何数据
│   └── style.css
├── public/
│   ├── triangle.obj        # 参考 OBJ 文件
│   └── d20.obj            # 二十面体 OBJ 文件
└── README.md
```

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

## 🎨 自定义扩展

### 添加新的几何体类型
1. 在 `CustomLoader.ts` 中添加新的处理逻辑
2. 确保设置正确的图层：`mesh.layers.set(ObjectLayers.PROPS)`
3. 添加到场景并请求重新渲染

### 支持更多数据格式
可以扩展 `CustomLoader` 支持：
- 立方体、球体等基本几何体
- 材质和纹理
- 动画效果
- 交互功能

### 遵循 Speckle 2.0 规范
- 使用正确的 `speckle_type` 标识符
- 实现适当的对象结构（如 BlockInstance 模式）
- 利用动态属性扩展功能
- 正确处理对象哈希和不可变性

## ⚠️ 注意事项

1. **图层设置**：自定义几何体必须设置到 PROPS 层
2. **面格式**：注意 Speckle 和 Three.js 的面格式差异
3. **颜色范围**：顶点颜色需要从 0-255 转换为 0-1
4. **渲染更新**：修改几何体后需要调用 `viewer.requestRender()`
5. **对象不可变性**：Speckle 对象一旦创建就不可变
6. **哈希管理**：让系统自动处理对象哈希，避免手动管理

## 🔧 故障排除

### 几何体不显示
- 检查是否设置了 `ObjectLayers.PROPS`
- 确认几何体已添加到场景
- 检查相机位置和视野

### 颜色不正确
- 确认顶点颜色已正确转换（除以 255）
- 检查材质设置是否正确

### 性能问题
- 避免在渲染循环中创建几何体
- 合理使用 `requestRender()` 调用

### Speckle 对象问题
- 确保 `speckle_type` 正确设置
- 检查对象结构是否符合 Speckle 2.0 规范
- 验证对象哈希是否正确生成