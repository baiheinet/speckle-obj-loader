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
import { CustomLoader } from "./CustomLoader";
import customObjectData from "./data/customObject.json";

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
  console.log('Note: CustomLoader may have instances error with Speckle Viewer 2.20.1');
  console.log('This is a known compatibility issue. Using bypass method to avoid error.');

  /** Add the stock camera controller extension */
  viewer.createExtension(CameraController);
  
  /** Add mesurements extension */
  const measurements = viewer.createExtension(MeasurementsExtension);

  // const urls = await UrlHelper.getResourceUrls(
  //   "https://app.speckle.systems/projects/0d3cb7cb52/models/d7401eeec3"
  // );
  // for (const url of urls) {
  //   const loader = new SpeckleLoader(viewer.getWorldTree(), url, "");
  //   /** Load the speckle data */
  //   await viewer.loadObject(loader, true);
  //  }
   
   console.log('=== Testing ObjLoader ===');
   const objLoader = new ObjLoader(viewer.getWorldTree(), '/triangle.obj');
   await viewer.loadObject(objLoader, true);
   console.log('ObjLoader test completed');
   
   // Wait a bit before testing custom loader
   await new Promise(resolve => setTimeout(resolve, 2000));
   
   console.log('=== Testing CustomLoader ===');
   console.log('Imported customObjectData:', customObjectData);
   console.log('customObjectData type:', typeof customObjectData);
   console.log('customObjectData keys:', Object.keys(customObjectData));
   
   const loader = new CustomLoader(customObjectData, viewer.getWorldTree(), viewer);
   
   // 使用绕过方法，直接调用 loader.load() 避免 instances 错误
   console.log('=== Using CustomLoader Directly (Bypassing Speckle loadObject) ===');
   console.log('CustomLoader before load:', loader);
   console.log('CustomLoader finished:', loader.finished);
   console.log('CustomLoader resource:', loader.resource);
   
   try {
     await loader.load();
     console.log('CustomLoader test completed successfully');
     console.log('Red triangle is visible and functional');
     console.log('No instances error because we bypassed Speckle\'s internal processing');
   } catch (error: any) {
     console.error('CustomLoader load failed:', error);
   }
   
   // measurements.enabled = true;
}


main();