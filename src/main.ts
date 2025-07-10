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
  // 移除无效的 LoadProgress、LoadComplete 事件绑定
  viewer.on(ViewerEvent.ObjectClicked, (selectionInfo) => {
    panel.setSelectedObject(selectionInfo);
  });

  // 用标准 @displayValue 结构
  const base = {
    id: "my-base-id",
    speckle_type: "Base",
    name: "DemoBase",
    bbox: {
      id: "bbox-id",
      area: 0,
      units: "m",
      xSize: {
        id: "xsize-id",
        end: 0,
        start: 0,
        units: "m",
        speckle_type: "Objects.Primitive.Interval",
        applicationId: null,
        totalChildrenCount: 0
      },
      ySize: {
        id: "ysize-id",
        end: 0,
        start: 0,
        units: "m",
        speckle_type: "Objects.Primitive.Interval",
        applicationId: null,
        totalChildrenCount: 0
      },
      zSize: {
        id: "zsize-id",
        end: 0,
        start: 0,
        units: "m",
        speckle_type: "Objects.Primitive.Interval",
        applicationId: null,
        totalChildrenCount: 0
      },
      volume: 0,
      basePlane: {
        id: "plane-id",
        xdir: {
          x: 1, y: 0, z: 0,
          id: "xdir-id",
          units: "m",
          speckle_type: "Objects.Geometry.Vector",
          applicationId: null,
          totalChildrenCount: 0
        },
        ydir: {
          x: 0, y: 1, z: 0,
          id: "ydir-id",
          units: "m",
          speckle_type: "Objects.Geometry.Vector",
          applicationId: null,
          totalChildrenCount: 0
        },
        normal: {
          x: 0, y: 0, z: 1,
          id: "normal-id",
          units: "m",
          speckle_type: "Objects.Geometry.Vector",
          applicationId: null,
          totalChildrenCount: 0
        },
        origin: {
          x: 0, y: 0, z: 0,
          id: "origin-id",
          units: "m",
          speckle_type: "Objects.Geometry.Point",
          applicationId: null,
          totalChildrenCount: 0
        },
        units: "m",
        speckle_type: "Objects.Geometry.Plane",
        applicationId: null,
        totalChildrenCount: 0
      },
      speckle_type: "Objects.Geometry.Box",
      applicationId: null,
      totalChildrenCount: 0
    },
    "@displayValue": [
      {
        id: "polyline-1",
        speckle_type: "Objects.Geometry.Polyline",
        value: [0,0,0, 5,0,0, 2.5,5,0],
        closed: true,
        units: "m",
        applicationId: null,
        totalChildrenCount: 0
      }
    ]
  }
  // 初始化时同步 base 到 TweakpanePanel 的 geometries，并添加颜色
  panel.geometries = base["@displayValue"].map(obj => ({ 
    ...obj, 
    color: "#ff0000" // 给初始几何体添加红色
  }))
  await panel.syncGeometriesToViewer()
  // 移除多余的 loader.loadObject，后续所有渲染都由 panel.syncGeometriesToViewer 控制
}

main();