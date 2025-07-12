import {
  SpeckleGeometryConverter,
  SpeckleLoader,
  SpeckleObject,
  WorldTree,
} from '@speckle/viewer';

export class SpeckleJSONObjectLoader extends SpeckleLoader {
  private viewer: any;
  constructor(targetTree: WorldTree, viewer: any, resourceData?: string | ArrayBuffer) {
    super(
      targetTree,
      'https://latest.speckle.dev/streams/dummy/objects/dummy',
      undefined,
      false,
      resourceData
    );
    this.viewer = viewer;
  }
  
  public async load(): Promise<boolean> {
    const parsedObj = JSON.parse(this._resourceData as string);
    /** Converter is private in base class,so we have to cheat */
    await (this as any).converter.traverse(
      this._resource,
      parsedObj as SpeckleObject,
      async () => {
        console.log('Finished');
      }
    );

    const t0 = performance.now();
    const geometryConverter = new SpeckleGeometryConverter();

    /** Tree is private in base class so have to cheat again */
    const renderTree = (this as any).tree.getRenderTree(this._resource);
    if (!renderTree) return Promise.resolve(false);
    
    const p = renderTree.buildRenderTree(geometryConverter);

    void p.then(async () => {
      console.log('Render tree built, attempting to set materials...');
      
      try {
        // 等待一帧确保渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 获取所有 RenderViews
        const worldTree = this.viewer.getWorldTree();
        const renderTree2 = worldTree.getRenderTree();
        const rvs = renderTree2.getRenderViewsForNode(worldTree.root);
        // 尝试设置材质
        const materialData = {
          color: 0xff0000, // 红色
          opacity: 1,
          roughness: 0.5,
          metalness: 0,
          vertexColors: false,
        };
          this.viewer.getRenderer().setMaterial(rvs, materialData);
          console.log('Attempting to set material for meshes:', materialData); 
          this.viewer.requestRender();
          console.log('Material setting completed');    
        
      } catch (error) {
        console.error('Error during material setting:', error);
      }
    });

    return p;
  }
} 