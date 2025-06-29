import { WorldTree, Loader, SpeckleObject, ObjectLayers } from '@speckle/viewer';
import * as THREE from 'three';
import { createSpeckleObject, parseProperties } from './utils/csvParser';

/**
 * CSV/Excel 数据加载器
 * 
 * 从 CSV 文件加载几何体数据，支持多个实例
 * 符合 Speckle Excel 集成标准
 */
export class CsvLoader extends Loader {

  public finished: boolean = false;
  public resource: string = '';
  public cancel: () => void;
  public dispose: () => void;
  public onProgress: (args: { url: string; progress: number }) => void;
  public onLoad: (args: { url: string; object: SpeckleObject }) => void;
  public onError: (args: { url: string; error: Error }) => void;
  public onLoadAll: (args: { url: string; objects: SpeckleObject[] }) => void;
  public on: (eventName: string | symbol, listener: (...args: any[]) => void) => this;
  public _events: any;
  public removeListener: (eventName: string | symbol, listener: (...args: any[]) => void) => this;
  public emit: (eventName: string | symbol, ...args: any[]) => boolean;
  
  private csvData: any[] = [];
  private worldTree: WorldTree;
  private viewer: any;
  private loadedObjects: any[] = [];

  constructor(csvData: any[], worldTree: WorldTree, viewer: any) {
    super('');
    this.csvData = csvData;
    this.worldTree = worldTree;
    this.viewer = viewer;
    this.finished = false;
    this.cancel = () => {};
    this.dispose = () => {};
    this.onProgress = () => {};
    this.onLoad = () => {};
    this.onError = () => {};
    this.onLoadAll = () => {};
    this.on = () => this;
    this._events = {};
    this.removeListener = () => this;
    this.emit = () => false;
  }

  async load(): Promise<boolean> {
    if (!this.csvData || this.csvData.length === 0) {
      throw new Error('CSV data is not provided or empty.');
    }

    console.log('CSV data:', this.csvData);
    
    try {
      // 为每个 CSV 行创建几何体
      for (const row of this.csvData) {
        await this.createMeshFromRow(row);
      }
      
      // 标记为完成
      this.finished = true;
      
      return true;
    } catch (error) {
      console.error('Error in CsvLoader.load():', error);
      throw error;
    }
  }

  /**
   * 从 CSV 行数据创建网格
   */
  private async createMeshFromRow(row: any): Promise<void> {
    console.log('=== Creating Mesh from CSV Row ===');
    console.log('Row data:', row);
    
    // 创建 Speckle 对象
    const speckleObject = createSpeckleObject(row);
    console.log('Created Speckle object:', speckleObject);
    
    // 解析顶点数据
    const vertices = speckleObject.vertices;
    const faces = speckleObject.faces;
    const colors = speckleObject.colors;
    
    if (!vertices || vertices.length === 0 || !faces || faces.length === 0) {
      throw new Error('Invalid geometry data in CSV row.');
    }

    // 创建 Three.js 几何体
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    console.log('Vertices array:', vertices);
    console.log('Faces array:', faces);
    console.log('Colors array:', colors);

    // 转换 Speckle 面格式到 Three.js 索引
    const indices = [];
    let i = 0;
    while (i < faces.length) {
      const type = faces[i];
      if (type === 0) { // Triangle
        indices.push(faces[i + 1], faces[i + 2], faces[i + 3]);
        i += 4;
      } else {
        i += 1 + type;
      }
    }
    
    console.log('Generated indices:', indices);
    
    if (indices.length > 0) {
      geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
    }

    // 添加顶点颜色
    if (colors && colors.length > 0) {
      const colorArray = new Float32Array(colors.map((c: number) => c / 255));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    }

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    // 创建材质
    const material = new THREE.MeshBasicMaterial({ 
      vertexColors: colors && colors.length > 0,
      side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);

    // 设置网格名称和用户数据
    if (speckleObject.name) {
      mesh.name = speckleObject.name;
    }
    
    // 添加 Speckle 对象数据到用户数据
    mesh.userData.speckleObject = speckleObject;
    mesh.userData.properties = speckleObject.properties;

    // 应用变换矩阵
    if (speckleObject.transform) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(speckleObject.transform.matrix);
      mesh.applyMatrix4(matrix);
    }

    // 设置网格到 PROPS 层
    mesh.layers.set(ObjectLayers.PROPS);

    // 将网格添加到场景
    const scene = this.viewer.getRenderer().scene;
    scene.add(mesh);

    console.log('Created and added mesh to scene:', mesh);
    console.log('Mesh name:', mesh.name);
    console.log('Mesh position:', mesh.position);
    console.log('Mesh material:', material);
    console.log('Mesh properties:', speckleObject.properties);
    
    // 强制渲染更新
    this.viewer.requestRender();
  }

  async unload(): Promise<void> {
    console.log('CsvLoader unload called');
  }

  // Getter 方法
  get resourceId(): string {
    return 'csv-geometry-data';
  }

  get totalItemsCount(): number {
    return this.csvData.length;
  }

  get currentItemsCount(): number {
    return this.finished ? this.csvData.length : 0;
  }

  get isFinished(): boolean {
    return this.finished;
  }

  get isCancelled(): boolean {
    return false;
  }

  get data(): any {
    return this.csvData.map(row => createSpeckleObject(row));
  }

  get objects(): any[] {
    return this.csvData.map(row => createSpeckleObject(row));
  }

  get instances(): any[] {
    return this.csvData.map(row => {
      const speckleObject = createSpeckleObject(row);
      return {
        id: speckleObject.id,
        speckle_type: speckleObject.speckle_type,
        applicationId: speckleObject.applicationId,
        name: speckleObject.name,
        description: speckleObject.description,
        transform: speckleObject.transform,
        properties: speckleObject.properties
      };
    });
  }

  get subtreeId(): string {
    return 'csv-subtree';
  }
} 