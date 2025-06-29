/**
 * 几何体生成器
 * 
 * 模拟 Speckle Python 示例的功能，动态生成各种几何体
 * 参考 Speckle Python 示例：https://github.com/specklesystems/speckle-docs-OLD/blob/main/dev/py-sample.md
 */

import { CsvRow } from './csvParser';

export interface GeometryConfig {
  type: 'triangle' | 'rectangle' | 'circle' | 'cube';
  position: [number, number, number];
  size: [number, number, number];
  color: [number, number, number];
  name?: string;
  description?: string;
  properties?: Record<string, string>;
  material?: string;
  transform?: number[];
}

export interface SceneConfig {
  name: string;
  description?: string;
  geometries: GeometryConfig[];
  globalProperties?: Record<string, string>;
}

/**
 * 基础几何体生成器类
 */
export class GeometryGenerator {
  private sceneConfig: SceneConfig;
  private generatedGeometries: CsvRow[] = [];

  constructor(sceneConfig?: SceneConfig) {
    this.sceneConfig = sceneConfig || {
      name: 'Default Scene',
      description: 'Auto-generated scene',
      geometries: []
    };
  }

  /**
   * 设置场景配置
   */
  setSceneConfig(config: SceneConfig): void {
    this.sceneConfig = config;
    console.log('Scene config updated:', config);
  }

  /**
   * 添加几何体配置
   */
  addGeometry(config: GeometryConfig): void {
    this.sceneConfig.geometries.push(config);
    console.log('Geometry config added:', config);
  }

  /**
   * 移除几何体配置
   */
  removeGeometry(index: number): void {
    if (index >= 0 && index < this.sceneConfig.geometries.length) {
      this.sceneConfig.geometries.splice(index, 1);
      console.log(`Geometry at index ${index} removed`);
    }
  }

  /**
   * 更新几何体配置
   */
  updateGeometry(index: number, config: GeometryConfig): void {
    if (index >= 0 && index < this.sceneConfig.geometries.length) {
      this.sceneConfig.geometries[index] = config;
      console.log(`Geometry at index ${index} updated:`, config);
    }
  }

  /**
   * 清空所有几何体
   */
  clearGeometries(): void {
    this.sceneConfig.geometries = [];
    console.log('All geometries cleared');
  }

  // 工具函数：兼容 color 为 #RRGGBB 或 RGB 数组
  private parseColor(color: any): [number, number, number] {
    if (typeof color === 'string' && color.startsWith('#') && color.length === 7) {
      return [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16)
      ];
    }
    if (Array.isArray(color) && color.length === 3) {
      return color as [number, number, number];
    }
    return [255, 0, 0];
  }

  /**
   * 生成三角形几何体
   */
  private generateTriangle(config: GeometryConfig): CsvRow {
    const [x, y, z] = config.position;
    const [width, height] = config.size;
    const [r, g, b] = this.parseColor(config.color);
    
    return {
      id: `triangle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      speckle_type: 'Objects.Geometry.Mesh',
      applicationId: `triangle-${config.name || 'auto'}`,
      name: config.name || 'Generated Triangle',
      description: config.description || 'Auto-generated triangle geometry',
      vertices: `${x},${y},${z},${x + width},${y},${z},${x},${y + height},${z}`,
      faces: '0,0,1,2',
      colors: `${r},${g},${b},${r},${g},${b},${r},${g},${b}`,
      bbox_min: `${x},${y},${z}`,
      bbox_max: `${x + width},${y + height},${z}`,
      area: (width * height) / 2,
      volume: 0.0,
      units: 'm',
      transform_matrix: config.transform ? config.transform.join(',') : '1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1',
      material: config.material || 'basic',
      properties: Object.entries({ ...this.sceneConfig.globalProperties, ...config.properties || {} })
        .map(([k, v]) => `${k}:${v}`).join(',')
    };
  }

  /**
   * 生成矩形几何体
   */
  private generateRectangle(config: GeometryConfig): CsvRow {
    const [x, y, z] = config.position;
    const [width, height] = config.size;
    const [r, g, b] = this.parseColor(config.color);
    
    const vertices = [
      x, y, z,
      x + width, y, z,
      x, y + height, z,
      x + width, y + height, z
    ];
    
    const colors = `${r},${g},${b},${r},${g},${b},${r},${g},${b},${r},${g},${b}`;
    
    return {
      id: `rectangle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      speckle_type: 'Objects.Geometry.Mesh',
      applicationId: `rectangle-${config.name || 'auto'}`,
      name: config.name || 'Generated Rectangle',
      description: config.description || 'Auto-generated rectangle geometry',
      vertices: vertices.join(','),
      faces: '0,0,1,2,0,2,3,1',
      colors,
      bbox_min: `${x},${y},${z}`,
      bbox_max: `${x + width},${y + height},${z}`,
      area: width * height,
      volume: 0.0,
      units: 'm',
      transform_matrix: config.transform ? config.transform.join(',') : '1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1',
      material: config.material || 'basic',
      properties: Object.entries({ ...this.sceneConfig.globalProperties, ...config.properties || {} })
        .map(([k, v]) => `${k}:${v}`).join(',')
    };
  }

  /**
   * 生成立方体几何体
   */
  private generateCube(config: GeometryConfig): CsvRow {
    const [x, y, z] = config.position;
    const [width, height, depth] = config.size;
    const [r, g, b] = this.parseColor(config.color);
    
    const vertices = [
      x, y, z,                    // 0
      x + width, y, z,           // 1
      x + width, y + height, z,  // 2
      x, y + height, z,          // 3
      x, y, z + depth,           // 4
      x + width, y, z + depth,   // 5
      x + width, y + height, z + depth, // 6
      x, y + height, z + depth   // 7
    ];
    
    const faces = [
      0, 0, 1, 2, 0, 0, 2, 3,   // 前面
      0, 4, 5, 6, 0, 4, 6, 7,   // 后面
      0, 0, 4, 7, 0, 0, 7, 3,   // 左面
      0, 1, 5, 6, 0, 1, 6, 2,   // 右面
      0, 3, 2, 6, 0, 3, 6, 7,   // 上面
      0, 0, 1, 5, 0, 0, 5, 4    // 下面
    ];
    
    const colors = Array(8).fill(`${r},${g},${b}`).join(',');
    
    return {
      id: `cube-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      speckle_type: 'Objects.Geometry.Mesh',
      applicationId: `cube-${config.name || 'auto'}`,
      name: config.name || 'Generated Cube',
      description: config.description || 'Auto-generated cube geometry',
      vertices: vertices.join(','),
      faces: faces.join(','),
      colors,
      bbox_min: `${x},${y},${z}`,
      bbox_max: `${x + width},${y + height},${z + depth}`,
      area: 2 * (width * height + width * depth + height * depth),
      volume: width * height * depth,
      units: 'm',
      transform_matrix: config.transform ? config.transform.join(',') : '1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1',
      material: config.material || 'basic',
      properties: Object.entries({ ...this.sceneConfig.globalProperties, ...config.properties || {} })
        .map(([k, v]) => `${k}:${v}`).join(',')
    };
  }

  /**
   * 生成圆形几何体
   */
  private generateCircle(config: GeometryConfig, segments: number = 16): CsvRow {
    const [x, y, z] = config.position;
    const [radius] = config.size;
    const [r, g, b] = this.parseColor(config.color);
    
    const vertices: number[] = [x, y, z]; // 中心点
    const colors: string[] = [`${r},${g},${b}`];
    
    // 生成圆周上的点
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      vertices.push(vx, vy, z);
      colors.push(`${r},${g},${b}`);
    }
    
    // 生成三角形面
    const faces: number[] = [];
    for (let i = 1; i < segments; i++) {
      faces.push(0, 0, i, i + 1);
    }
    faces.push(0, 0, segments, 1); // 连接最后一个和第一个
    
    return {
      id: `circle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      speckle_type: 'Objects.Geometry.Mesh',
      applicationId: `circle-${config.name || 'auto'}`,
      name: config.name || 'Generated Circle',
      description: config.description || 'Auto-generated circle geometry',
      vertices: vertices.join(','),
      faces: faces.join(','),
      colors: colors.join(','),
      bbox_min: `${x - radius},${y - radius},${z}`,
      bbox_max: `${x + radius},${y + radius},${z}`,
      area: Math.PI * radius * radius,
      volume: 0.0,
      units: 'm',
      transform_matrix: config.transform ? config.transform.join(',') : '1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1',
      material: config.material || 'basic',
      properties: Object.entries({ ...this.sceneConfig.globalProperties, ...config.properties || {} })
        .map(([k, v]) => `${k}:${v}`).join(',')
    };
  }

  /**
   * 生成单个几何体
   */
  private generateGeometry(config: GeometryConfig): CsvRow {
    switch (config.type) {
      case 'triangle':
        return this.generateTriangle(config);
      case 'rectangle':
        return this.generateRectangle(config);
      case 'cube':
        return this.generateCube(config);
      case 'circle':
        return this.generateCircle(config);
      default:
        throw new Error(`Unsupported geometry type: ${config.type}`);
    }
  }

  /**
   * 生成所有几何体
   */
  generate(): CsvRow[] {
    console.log('Generating geometries from config:', this.sceneConfig);
    this.generatedGeometries = this.sceneConfig.geometries.map(config => this.generateGeometry(config));
    console.log('Generated geometries:', this.generatedGeometries);
    return this.generatedGeometries;
  }

  /**
   * 获取当前场景配置
   */
  getSceneConfig(): SceneConfig {
    return this.sceneConfig;
  }

  /**
   * 获取生成的几何体
   */
  getGeneratedGeometries(): CsvRow[] {
    return this.generatedGeometries;
  }
}

/**
 * 创建默认示例场景
 */
export function createDefaultScene(): SceneConfig {
  return {
    name: 'Default Example Scene',
    description: 'A scene with various geometric shapes',
    globalProperties: {
      type: 'example',
      version: '1.0'
    },
    geometries: [
      {
        type: 'triangle',
        position: [0, 0, 0],
        size: [2, 2, 0],
        color: [255, 0, 0],
        name: 'Red Triangle',
        description: 'Example red triangle',
        properties: { priority: 'high' }
      },
      {
        type: 'rectangle',
        position: [3, 0, 0],
        size: [1.5, 1, 0],
        color: [0, 255, 0],
        name: 'Green Rectangle',
        description: 'Example green rectangle',
        properties: { priority: 'medium' }
      },
      {
        type: 'cube',
        position: [0, 3, 0],
        size: [1, 1, 1],
        color: [0, 0, 255],
        name: 'Blue Cube',
        description: 'Example blue cube',
        properties: { priority: 'low' }
      },
      {
        type: 'circle',
        position: [3, 3, 0],
        size: [1, 1, 0],
        color: [255, 255, 0],
        name: 'Yellow Circle',
        description: 'Example yellow circle',
        properties: { priority: 'medium' }
      }
    ]
  };
}

/**
 * 便捷函数：生成示例场景
 */
export function generateExampleScene(): CsvRow[] {
  const generator = new GeometryGenerator(createDefaultScene());
  return generator.generate();
} 