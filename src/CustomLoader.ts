import { WorldTree, Loader, SpeckleObject, ObjectLayers } from '@speckle/viewer';
import * as THREE from 'three';

/**
 * CustomLoader for Speckle Viewer
 * 
 * 符合 Speckle 官方标准的加载器实现
 * 1. 填充 WorldTree
 * 2. 使用 GeometryConverter 转换数据
 * 3. 构建 RenderTree
 */
export class CustomLoader extends Loader {

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
  private customObject: any;
  private worldTree: WorldTree;
  private viewer: any;
  private loadedObjects: any[] = [];

  constructor(customObject: any, worldTree: WorldTree, viewer: any) {
    super('');
    this.customObject = customObject;
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
    if (!this.customObject) {
      throw new Error('Custom object data is not provided.');
    }

    console.log('Custom object:', this.customObject);
    
    try {
      // 创建 Three.js 几何体并添加到场景
      await this.createThreeJsMesh();
      
      // 标记为完成
      this.finished = true;
      
      return true;
    } catch (error) {
      console.error('Error in CustomLoader.load():', error);
      throw error;
    }
  }

  /**
   * 创建 Three.js 网格并添加到场景
   */
  private async createThreeJsMesh(): Promise<void> {
    console.log('=== Creating Three.js Mesh ===');
    
    // 检查是否是实例对象
    if (this.customObject.speckle_type === 'Objects.Other.BlockInstance') {
      console.log('Processing BlockInstance');
      
      // 从 definition.displayValue 中获取几何体
      const definition = this.customObject.definition;
      if (!definition || !definition.displayValue || !Array.isArray(definition.displayValue)) {
        throw new Error('Invalid BlockInstance: missing definition or displayValue');
      }
      
      // 获取第一个几何体对象
      const geometryObject = definition.displayValue[0];
      if (!geometryObject || geometryObject.speckle_type !== 'Objects.Geometry.Mesh') {
        throw new Error('Invalid geometry object in definition.displayValue');
      }
      
      console.log('Geometry object from definition:', geometryObject);
      
      // 使用几何体对象的数据
      const vertices = geometryObject.vertices;
      const faces = geometryObject.faces;
      
      if (!vertices || !Array.isArray(vertices) || vertices.length === 0 || !faces || !Array.isArray(faces) || faces.length === 0) {
      throw new Error('Custom object does not contain valid display mesh data.');
    }

      // 直接创建 Three.js 几何体
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      console.log('Vertices array:', vertices);
      console.log('Faces array:', faces);
      console.log('Position attribute:', geometry.getAttribute('position'));

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
        console.log('Index attribute:', geometry.getIndex());
      }

      geometry.computeVertexNormals();
      geometry.computeBoundingBox();

      console.log('Geometry after setup:', geometry);
      console.log('Geometry bounds after computeBoundingBox:', geometry.boundingBox);

      // 创建材质和网格
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        side: THREE.DoubleSide 
      });
      const mesh = new THREE.Mesh(geometry, material);

      // 设置网格到 PROPS 层，这样 Speckle 不会干扰它
      mesh.layers.set(ObjectLayers.PROPS);

      // 将网格添加到场景
      const scene = this.viewer.getRenderer().scene;
      scene.add(mesh);

      // 添加更多调试信息
      console.log('=== Scene Debug Info ===');
      console.log('All scene children:', scene.children);
      console.log('Scene children types:', scene.children.map((child: any) => child.type));
      console.log('Scene children names:', scene.children.map((child: any) => child.name));
      console.log('Red triangle mesh found:', scene.children.find((child: any) => child.type === 'Mesh' && child.material?.color?.getHex() === 0xff0000));
      
      // 检查是否有其他红色对象
      const redMeshes = scene.children.filter((child: any) => 
        child.type === 'Mesh' && 
        child.material?.color?.getHex() === 0xff0000
      );
      console.log('Red meshes in scene:', redMeshes.length);

      console.log('Created and added Three.js mesh to scene:', mesh);
      console.log('Scene children count:', scene.children.length);
      console.log('Mesh position:', mesh.position);
      console.log('Mesh scale:', mesh.scale);
      console.log('Mesh geometry bounds:', geometry.boundingBox);
      console.log('Mesh visible:', mesh.visible);
      console.log('Material color:', material.color);
      console.log('Mesh in scene:', scene.children.includes(mesh));
      console.log('Mesh layers:', mesh.layers);
      
      // 强制渲染更新
      this.viewer.requestRender();
    } else {
      throw new Error('Unsupported object type: ' + this.customObject.speckle_type);
    }
  }

  async unload(): Promise<void> {
    console.log('CustomLoader unload called');
  }

  // 添加其他可能需要的属性
  get resourceId(): string {
    return this.customObject.id || 'custom-mesh';
  }

  get totalItemsCount(): number {
    return 1;
  }

  get currentItemsCount(): number {
    return this.finished ? 1 : 0;
  }

  // 添加更多可能需要的属性
  get isFinished(): boolean {
    return this.finished;
  }

  get isCancelled(): boolean {
    return false;
  }

  // 添加一个方法来返回数据，这可能是 Speckle 期望的
  get data(): any {
    console.log('CustomLoader data getter called');
    const result = {
      ...this.customObject,
      instances: [{
        id: this.customObject.id,
        speckle_type: this.customObject.speckle_type,
        transform: this.customObject.transform,
        definition: this.customObject.definition
      }]
    };
    console.log('CustomLoader data getter returning:', result);
    return result;
  }

  // 添加一个方法来返回对象，这可能是 Speckle 期望的
  get objects(): any[] {
    return [this.customObject];
  }

  // 添加一个方法来返回实例，这可能是 Speckle 期望的
  get instances(): any[] {
    console.log('CustomLoader instances getter called');
    const result = [{
      id: this.customObject.id,
      speckle_type: this.customObject.speckle_type,
      transform: this.customObject.transform,
      definition: this.customObject.definition
    }];
    console.log('CustomLoader instances getter returning:', result);
    return result;
  }
}