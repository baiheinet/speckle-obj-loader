/**
 * 使用 Tweakpane 的几何体操作面板
 */

import { Pane } from 'tweakpane';
import { SpeckleJSONObjectLoader } from '../SpeckleJSONObjectLoader'

export class TweakpanePanel {
  private pane: any;
  private tabs: any;
  private viewer: any;
  public geometries: any[] = [];
  private selectedObjRef: any = null;
  private propertyInputs: any[] = [];
  private selObjPre!: HTMLPreElement;

  constructor(viewer: any) {
    this.viewer = viewer;
    const panelContainer = document.getElementById('tweakpane-container') as HTMLElement;
    this.pane = new Pane({ container: panelContainer, title: 'Speckle Sandbox', expanded: true });
    (this.pane as any).containerElem_.style = 'position:fixed; top:20px; right:20px; width:320px;z-index:1000;';
    this.tabs = this.pane.addTab({ pages: [ { title: '主页' }, { title: '场景' } ] });
  }

  public makeGenericUI() {
    if ((this as any)._uiInited) return;
    (this as any)._uiInited = true;
    const page = this.tabs.pages[0];
    // 只保留 Polyline 参数
    const geoParams: any = {
      x1: 0, y1: 0, z1: 0,
      x2: 10, y2: 0, z2: 0,
      x3: 10, y3: 10, z3: 0,
      closed: true,
      units: 'm',
      name: 'Polyline'
    }
    page.addInput(geoParams, 'x1', { label: 'X1' })
    page.addInput(geoParams, 'y1', { label: 'Y1' })
    page.addInput(geoParams, 'z1', { label: 'Z1' })
    page.addInput(geoParams, 'x2', { label: 'X2' })
    page.addInput(geoParams, 'y2', { label: 'Y2' })
    page.addInput(geoParams, 'z2', { label: 'Z2' })
    page.addInput(geoParams, 'x3', { label: 'X3' })
    page.addInput(geoParams, 'y3', { label: 'Y3' })
    page.addInput(geoParams, 'z3', { label: 'Z3' })
    page.addInput(geoParams, 'closed', { label: '闭合' })
    page.addInput(geoParams, 'units', { label: '单位' })
    page.addInput(geoParams, 'name', { label: '名称' })
    page.addButton({ title: '添加几何体' }).on('click', () => this.addGeometry({ ...geoParams, type: 'Polyline' }))
    
    // 添加几何体数量显示
    const geometryCountFolder = page.addFolder({ title: '几何体列表', expanded: true });
    const countObj = { count: 0 };
    const countText = geometryCountFolder.addMonitor(countObj, 'count', { label: '总数' });
    
    // 更新几何体数量的方法
    const updateGeometryCount = () => {
      const count = this.geometries.length;
      console.log('Updating geometry count to:', count);
      countObj.count = count;
      this.pane.refresh();
    };
    
    // 保存原始的 addGeometry 方法
    const originalAddGeometry = this.addGeometry.bind(this);
    
    // 重写 addGeometry 方法来更新计数
    this.addGeometry = async (geoParams?: any) => {
      await originalAddGeometry(geoParams);
      updateGeometryCount();
    };
    
    // 保存原始的 syncGeometriesToViewer 方法
    const originalSyncGeometriesToViewer = this.syncGeometriesToViewer.bind(this);
    
    // 重写 syncGeometriesToViewer 方法来更新计数
    this.syncGeometriesToViewer = async () => {
      await originalSyncGeometriesToViewer();
      updateGeometryCount();
    };
    
    // 创建一个清空方法
    const clearAllGeometries = async () => {
      console.log('Clearing all geometries');
      this.geometries = [];
      await this.viewer.unloadAll();
      updateGeometryCount();
      this.pane.refresh();
    };
    
    // 添加清空所有几何体的按钮
    page.addButton({ title: '清空所有几何体' }).on('click', clearAllGeometries);
    
    if (!this.selObjPre) {
      this.selObjPre = document.createElement('pre')
      this.selObjPre.style.maxHeight = '120px'
      this.selObjPre.style.overflow = 'auto'
      this.selObjPre.style.background = '#f8f8f8'
      this.selObjPre.style.fontSize = '12px'
      this.selObjPre.style.margin = '8px 0'
      this.pane.containerElem_.appendChild(this.selObjPre)
    }
    page.addButton({ title: '清空选中' }).on('click', () => this.clearSelection());
    
    // 初始化计数
    setTimeout(() => {
      updateGeometryCount();
    }, 100);
  }

  public makeSceneUI() {
    const page = this.tabs.pages[1];
    // 场景参数分组
    const sceneParams = {
      exposure: 0.5,
      tonemapping: 4 // 'ACESFilmicToneMapping'
    };
    page.addSeparator();
    page.addInput(sceneParams, 'exposure', { min: 0, max: 1, label: '曝光' }).on('change', () => {
      this.viewer.getRenderer().renderer.toneMappingExposure = sceneParams.exposure;
      this.viewer.requestRender();
    });
    page.addInput(sceneParams, 'tonemapping', {
      options: { Linear: 1, ACES: 4 }, label: '色调映射'
    }).on('change', () => {
      this.viewer.getRenderer().renderer.toneMapping = sceneParams.tonemapping;
      this.viewer.requestRender();
    });
  }

  public async addGeometry(geoParams?: any) {
    if (geoParams && geoParams.type === 'Polyline') {
      let value: number[] = [];
      if (
        geoParams.x1 !== undefined && geoParams.y1 !== undefined && geoParams.z1 !== undefined &&
        geoParams.x2 !== undefined && geoParams.y2 !== undefined && geoParams.z2 !== undefined &&
        geoParams.x3 !== undefined && geoParams.y3 !== undefined && geoParams.z3 !== undefined
      ) {
        value = [
          geoParams.x1, geoParams.y1, geoParams.z1,
          geoParams.x2, geoParams.y2, geoParams.z2,
          geoParams.x3, geoParams.y3, geoParams.z3
        ];
      } else {
        // 默认创建一个简单的三角形
        value = [0,0,0, 5,0,0, 2.5,5,0];
      }
      
      const geometryData: any = {
        id: "polyline-" + Date.now(),
        speckle_type: "Objects.Geometry.Polyline",
        value: value, // 直接使用用户输入的坐标
        closed: geoParams.closed ?? true,
        units: geoParams.units || "m",
        name: geoParams.name || "Polyline",
        applicationId: null,
        totalChildrenCount: 0,
        color: 0xff0000
      };
      
      this.geometries.push(geometryData);
      console.log(`Added geometry ${this.geometries.length} (Polyline):`, geometryData);
    }
    await this.syncGeometriesToViewer();
    this.pane.refresh();
    if (this.geometries.length > 0) {
      this.setSelectedObject(this.geometries[this.geometries.length - 1]);
    }
  }

  public async syncGeometriesToViewer() {
    // 清除所有现有对象
    await this.viewer.unloadAll();
    
    // 简化的 Base 对象
    const base: any = {
      id: "multi-geometry-base",
      speckle_type: "Base",
      name: "MultiGeometryBase",
      "@displayValue": []
    };
    
    // 将所有几何体添加到 @displayValue 数组中
    this.geometries.forEach((geometry) => {
      base["@displayValue"].push(geometry);
    });
    
    console.log('Loading multi-geometry base:', base);
    const loader = new SpeckleJSONObjectLoader(this.viewer.getWorldTree(), this.viewer, JSON.stringify(base));
    await this.viewer.loadObject(loader, true);
    
  }

 

  public setSelectedObject(obj: any) {
    this.selectedObjRef = obj;
    this.selObjPre.textContent = JSON.stringify(obj, null, 2);
  }

  public clearSelection() {
    this.selectedObjRef = null;
    this.selObjPre.textContent = '';
  }
}