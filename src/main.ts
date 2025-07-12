import "./style.css";
import {
  Viewer,
  DefaultViewerParams,
  CameraController,
  ViewerEvent
} from "@speckle/viewer";
import { TweakpanePanel } from "./components/TweakpanePanel";
async function main() {
  /** Get the HTML container */
  const container = document.getElementById("renderer") as HTMLElement;

  /** Configure the viewer params */
  const params = DefaultViewerParams;
  params.verbose = true;

  /** Create Viewer instance */
  const viewer = new Viewer(container, params);
  /** Initialise the viewer */
  await viewer.init();

  /** Add the stock camera controller extension */
  viewer.createExtension(CameraController);

  // 创建 TweakpanePanel 并初始化UI
  const panel = new TweakpanePanel(viewer);
  panel.makeGenericUI();
  panel.makeSceneUI();

  // 监听 viewer 事件
  viewer.on(ViewerEvent.ObjectClicked, (selectionInfo) => {
    panel.setSelectedObject(selectionInfo);
  });

  // 首页默认：一个闭合多边形（Slab）和一个Mesh（Wall）
  const polygon = {
    id: "polyline-1",
    speckle_type: "Objects.Geometry.Polyline",
    value: [0,5,0, 10,5,0, 10,15,0, 0,15,0, 0,5,0],
    closed: true,
    units: "m",
    name: "Slab",
    colorMaterial: {
      color: 0xff0000,
      opacity: 1,
      roughness: 0.5,
      metalness: 0,
      vertexColors: false,
    }
  };

  // 批量生成10个标准 Mesh
  const meshes = [];
  for (let i = 0; i < 10; i++) {
    const mesh = {
      id: `mesh-${i+1}`,
      speckle_type: "Objects.Geometry.Mesh",
      type: "Mesh",
      vertices: [
        0+i*20,0,0, 10+i*20,0,0, 10+i*20,0,10, 0+i*20,0,10
      ],
      faces: [0,0,1,2, 0,0,2,3], // 两个三角面
      colors: [],
      textureCoordinates: [],
      name: `Wall${i+1}`,
      units: "m"
    };
    meshes.push(mesh);
  }

  const base = {
    id: "my-base-id",
    speckle_type: "Base",
    name: "DemoBase",
    "@displayValue": [polygon, ...meshes]
  };

  // 初始化时同步 base 到 TweakpanePanel 的 geometries
  panel.geometries = base["@displayValue"].map(obj => ({ ...obj }))
  await panel.syncGeometriesToViewer()
}

main();