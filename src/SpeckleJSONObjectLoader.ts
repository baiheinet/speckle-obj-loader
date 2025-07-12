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
    // --- 新增：渲染完成后批量设置所有 Mesh 材质为红色 ---
 

    void p.then(() => {
      // 关键：补全 batching 逻辑
      renderTree.batch();

      // 后续 setMaterial 逻辑
      const worldTree = this.viewer.getWorldTree();
      const renderTree2 = worldTree.getRenderTree();
      const rvs = renderTree2.getRenderViewsForNode(worldTree.root);
      const materialData = {
        color: 0xff0000,
        opacity: 1,
        roughness: 0.5,
        metalness: 0,
        vertexColors: false,
      };
      this.viewer.getRenderer().setMaterial(rvs, materialData);
      this.viewer.requestRender();
    });

    return p;
  }
} 