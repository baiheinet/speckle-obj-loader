import "./style.css";
import {
  Viewer,
  DefaultViewerParams,
  ObjLoader,
  SpeckleLoader,
  UrlHelper,
  CameraController,
  MeasurementsExtension,
  ObjectLayers
} from "@speckle/viewer";
import { GeometryGenerator, createDefaultScene, generateExampleScene } from "./utils/geometryGenerator";
import { GeometryPanel } from "./components/GeometryPanel";

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

  // 检查 Speckle Viewer 版本
  console.log('=== Speckle Viewer Version Check ===');
  console.log('Speckle Viewer version:', (window as any).SPECKLE_VERSION || 'Unknown');
  console.log('Note: Using flexible geometry generator as per Speckle Python sample');

  /** Add the stock camera controller extension */
  viewer.createExtension(CameraController);
  
  /** Add mesurements extension */
  const measurements = viewer.createExtension(MeasurementsExtension);

  // 加载参考几何体
  console.log('开始加载参考几何体...');
  const objLoader = new ObjLoader(viewer.getWorldTree(), '/triangle.obj');
  await viewer.loadObject(objLoader, true);
  console.log('参考几何体加载完成');
  
  // 创建几何体生成器实例
  const generator = new GeometryGenerator();
  
  // 设置空场景配置，不加载默认几何体
  generator.setSceneConfig({
    name: '用户自定义场景',
    description: '用户动态添加的几何体',
    globalProperties: {
      type: 'user_created',
      version: '1.0'
    },
    geometries: [] // 空数组，不包含默认几何体
  });
  
  // ========== 集成 GeometryPanel ==========
  // 挂载到页面右上角
  const panel = new GeometryPanel(document.body, generator, viewer);
  // 挂载到 window 以便 HTML 按钮调用
  (window as any).geometryPanel = panel;
  console.log('GeometryPanel 已挂载到 window.geometryPanel:', panel);
  // =======================================

  // measurements.enabled = true;
}

main();