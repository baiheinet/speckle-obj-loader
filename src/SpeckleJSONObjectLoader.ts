import {
  SpeckleGeometryConverter,
  SpeckleLoader,
  SpeckleObject,
  WorldTree,
} from '@speckle/viewer';

export class SpeckleJSONObjectLoader extends SpeckleLoader {
  constructor(targetTree: WorldTree, resourceData?: string | ArrayBuffer) {
    super(
      targetTree,
      'https://latest.speckle.dev/streams/dummy/objects/dummy',
      undefined,
      false,
      resourceData
    );
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

    void p.then(() => {
      console.log('ASYNC Tree build time -> ', performance.now() - t0);
    });

    return p;
  }
} 