/**
 * 几何体操作面板
 * 
 * 提供图形化界面来添加、修改、删除几何体
 */

export class GeometryPanel {
  private container: HTMLElement;
  private generator: any;
  private viewer: any;
  private panel: HTMLElement;

  constructor(container: HTMLElement, generator: any, viewer: any) {
    this.container = container;
    this.generator = generator;
    this.viewer = viewer;
    this.panel = this.createPanel();
    this.container.appendChild(this.panel);
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'geometry-panel';

    panel.innerHTML = `
      <h3>几何体操作面板</h3>
      
      <div>
        <h4>添加新几何体</h4>
        <select id="geometryType">
          <option value="triangle">三角形</option>
          <option value="rectangle">矩形</option>
          <option value="cube">立方体</option>
          <option value="circle">圆形</option>
        </select>
        
        <div class="position-grid">
          <input type="number" id="posX" placeholder="X 位置" value="0" step="0.1" title="X 坐标位置">
          <input type="number" id="posY" placeholder="Y 位置" value="0" step="0.1" title="Y 坐标位置">
          <input type="number" id="posZ" placeholder="Z 位置" value="0" step="0.1" title="Z 坐标位置">
        </div>
        
        <div class="size-grid" id="sizeGrid">
          <input type="number" id="sizeX" placeholder="宽/长/半径" value="1" step="0.1" title="宽/长/半径">
          <input type="number" id="sizeY" placeholder="高/宽" value="1" step="0.1" title="高/宽" style="display:none;">
          <input type="number" id="sizeZ" placeholder="厚/高" value="0" step="0.1" title="厚/高" style="display:none;">
        </div>
        
        <div class="color-grid">
          <input type="color" id="colorHex" value="#ff0000" title="选择颜色">
          <input type="text" id="colorHexText" value="#ff0000" maxlength="7" pattern="#?[0-9a-fA-F]{6}" style="width:90px;" title="十六进制颜色，如#646cff">
        </div>
        
        <input type="text" id="geometryName" placeholder="几何体名称（可选）" title="为几何体指定一个名称，如果不填将自动生成">
        
        <button id="addGeometry" class="btn btn-primary">添加几何体</button>
      </div>
      
      <div>
        <h4>几何体列表</h4>
        <div id="geometryList" class="geometry-list">
          <div class="empty-state">暂无几何体</div>
        </div>
      </div>
      
      <div>
        <h4>批量操作</h4>
        <div class="btn-group">
          <button id="clearAll" class="btn btn-danger">清空所有</button>
          <button id="clearScene" class="btn btn-warning">清空场景</button>
        </div>
        <div class="btn-group">
          <button id="batchImport" class="btn btn-primary">批量导入</button>
          <button id="exportData" class="btn btn-warning">导出数据</button>
        </div>
      </div>
      
      <div>
        <h4>场景信息</h4>
        <div id="sceneInfo" class="scene-info">
          几何体数量: 0
        </div>
      </div>
      
      <!-- 批量导入模态框 -->
      <div id="batchImportModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>批量导入几何体</h3>
            <span class="close" onclick="document.getElementById('batchImportModal').style.display='none'">&times;</span>
          </div>
          <div class="modal-body">
            <p>输入 CSV 格式的几何体数据：</p>
            <textarea id="csvInput" placeholder='name,type,position_x,position_y,position_z,size_x,size_y,size_z,color\n红色三角形,triangle,0,0,0,1,1,0,#ff0000\n绿色矩形,rectangle,2,0,0,1.5,1,0,#00ff00\n蓝色立方体,cube,4,0,0,1,1,1,#0000ff\n黄色圆形,circle,6,0,0,0.8,0.8,0,#ffff00' rows="10"></textarea>
            <div class="csv-info">
              <p><strong>CSV 格式说明：</strong></p>
              <p>字段：name, type, position_x, position_y, position_z, size_x, size_y, size_z, color</p>
              <p>color 字段为十六进制颜色字符串，如 #646cff</p>
            </div>
          </div>
          <div class="modal-footer">
            <button id="importBtn" class="btn btn-primary" onclick="window.geometryPanel.handleImportDirect()">导入</button>
            <button id="cancelImport" class="btn btn-secondary" onclick="document.getElementById('batchImportModal').style.display='none'">取消</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(panel);
    return panel;
  }

  private bindEvents(panel: HTMLElement): void {
    // 添加几何体按钮
    const addBtn = panel.querySelector('#addGeometry') as HTMLButtonElement;
    addBtn.addEventListener('click', () => this.addGeometry());

    // 清空所有按钮
    const clearBtn = panel.querySelector('#clearAll') as HTMLButtonElement;
    clearBtn.addEventListener('click', () => this.clearAllGeometries());

    // 清空场景按钮
    const clearSceneBtn = panel.querySelector('#clearScene') as HTMLButtonElement;
    clearSceneBtn.addEventListener('click', () => this.clearScene());

    // 批量导入按钮
    const batchImportBtn = panel.querySelector('#batchImport') as HTMLButtonElement;
    batchImportBtn.addEventListener('click', () => this.showBatchImportModal());

    // 导出数据按钮
    const exportDataBtn = panel.querySelector('#exportData') as HTMLButtonElement;
    exportDataBtn.addEventListener('click', () => this.exportData());

    // 几何体类型选择变化时更新尺寸标签
    const typeSelect = panel.querySelector('#geometryType') as HTMLSelectElement;
    typeSelect.addEventListener('change', () => this.updateSizeLabel());
    
    // 初始化尺寸标签
    this.updateSizeLabel();
    
    // 绑定模态框事件
    this.bindModalEvents();

    // 颜色选择器和文本框同步
    const colorInput = panel.querySelector('#colorHex') as HTMLInputElement;
    const colorText = panel.querySelector('#colorHexText') as HTMLInputElement;
    if (colorInput && colorText) {
      colorInput.addEventListener('input', () => {
        colorText.value = colorInput.value;
      });
      colorText.addEventListener('input', () => {
        if (/^#?[0-9a-fA-F]{6}$/.test(colorText.value)) {
          colorInput.value = colorText.value.startsWith('#') ? colorText.value : ('#' + colorText.value);
        }
      });
    }
  }

  private updateSizeLabel(): void {
    const typeSelect = document.getElementById('geometryType') as HTMLSelectElement;
    const sizeX = document.getElementById('sizeX') as HTMLInputElement;
    const sizeY = document.getElementById('sizeY') as HTMLInputElement;
    const sizeZ = document.getElementById('sizeZ') as HTMLInputElement;
    if (!typeSelect || !sizeX || !sizeY || !sizeZ) return;
    const type = typeSelect.value;
    switch (type) {
      case 'cube':
        sizeX.placeholder = '长';
        sizeY.placeholder = '宽';
        sizeZ.placeholder = '高';
        sizeX.style.display = '';
        sizeY.style.display = '';
        sizeZ.style.display = '';
        break;
      case 'rectangle':
      case 'triangle':
        sizeX.placeholder = '宽';
        sizeY.placeholder = '高';
        sizeZ.placeholder = '厚(可选)';
        sizeX.style.display = '';
        sizeY.style.display = '';
        sizeZ.style.display = 'none';
        break;
      case 'circle':
        sizeX.placeholder = '半径';
        sizeY.placeholder = '';
        sizeZ.placeholder = '';
        sizeX.style.display = '';
        sizeY.style.display = 'none';
        sizeZ.style.display = 'none';
        break;
      default:
        sizeX.placeholder = '尺寸';
        sizeY.style.display = 'none';
        sizeZ.style.display = 'none';
        break;
    }
  }

  private async addGeometry(): Promise<void> {
    const type = (document.getElementById('geometryType') as HTMLSelectElement).value;
    const posX = parseFloat((document.getElementById('posX') as HTMLInputElement).value);
    const posY = parseFloat((document.getElementById('posY') as HTMLInputElement).value);
    const posZ = parseFloat((document.getElementById('posZ') as HTMLInputElement).value);
    const colorHex = (document.getElementById('colorHexText') as HTMLInputElement).value || '#ff0000';
    const name = (document.getElementById('geometryName') as HTMLInputElement).value || `几何体_${Date.now()}`;
    // 尺寸
    const sizeX = parseFloat((document.getElementById('sizeX') as HTMLInputElement).value) || 1;
    const sizeY = parseFloat((document.getElementById('sizeY') as HTMLInputElement).value) || 1;
    const sizeZ = parseFloat((document.getElementById('sizeZ') as HTMLInputElement).value) || 0;
    let size: [number, number, number];
    switch (type) {
      case 'cube':
        size = [sizeX, sizeY, sizeZ];
        break;
      case 'rectangle':
      case 'triangle':
        size = [sizeX, sizeY, 0];
        break;
      case 'circle':
        size = [sizeX, sizeX, 0];
        break;
      default:
        size = [sizeX, 1, 0];
        break;
    }
    const config = {
      type: type as any,
      position: [posX, posY, posZ],
      size: size,
      color: colorHex,
      name: name,
      description: `用户创建的${type}`,
      properties: { 
        source: 'panel',
        timestamp: Date.now().toString(),
        user: 'interactive'
      }
    };
    this.generator.addGeometry(config);
    await this.reloadGeometries();
    this.updateGeometryList();
    this.updateSceneInfo();
  }

  private async clearAllGeometries(): Promise<void> {
    if (confirm('确定要清空所有几何体吗？')) {
      this.generator.clearGeometries();
      await this.reloadGeometries();
      this.updateGeometryList();
      this.updateSceneInfo();
      console.log('所有几何体已清空');
    }
  }

  private async reloadGeometries(): Promise<void> {
    // 重新生成几何体数据
    const generatedData = this.generator.generate();
    
    // 如果没有几何体，清空场景中的用户创建的网格
    if (generatedData.length === 0) {
      console.log('没有几何体数据，清空场景中的用户网格');
      const scene = this.viewer.getRenderer().scene;
      const meshesToRemove: any[] = [];
      
      scene.traverse((child: any) => {
        if (child.type === 'Mesh' && child.name !== 'triangle.obj') {
          meshesToRemove.push(child);
        }
      });
      
      // 移除所有用户创建的网格
      meshesToRemove.forEach(mesh => {
        scene.remove(mesh);
        try {
          if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
            mesh.geometry.dispose();
          }
          if (mesh.material && typeof mesh.material.dispose === 'function') {
            mesh.material.dispose();
          }
        } catch (error) {
          console.warn('清理网格资源时出错:', error);
        }
      });
      
      // 强制更新渲染 - 使用多种方法确保更新
      try {
        // 延迟渲染更新，确保 DOM 更新完成
        setTimeout(() => {
          // 方法1: 直接渲染
          this.viewer.getRenderer().render(this.viewer.getRenderer().scene, this.viewer.getRenderer().camera);
          
          // 方法2: 通知 viewer 场景发生变化
          if (this.viewer.requestRender) {
            this.viewer.requestRender();
          }
          
          // 方法3: 强制重新渲染
          if (this.viewer.getRenderer() && this.viewer.getRenderer().render) {
            this.viewer.getRenderer().render(
              this.viewer.getRenderer().scene, 
              this.viewer.getRenderer().camera
            );
          }
          
          // 方法4: 使用 Speckle Viewer 的特定方法
          if (this.viewer.invalidate) {
            this.viewer.invalidate();
          }
          
          // 方法5: 触发 resize 事件来强制重新渲染
          window.dispatchEvent(new Event('resize'));
        }, 0);
      } catch (error) {
        console.warn('强制渲染更新时出错:', error);
      }
      return;
    }
    
    // 创建新的加载器并加载
    const { CsvLoader } = await import('../CsvLoader');
    const loader = new CsvLoader(generatedData, this.viewer.getWorldTree(), this.viewer);
    await loader.load();
  }

  private updateGeometryList(): void {
    const listContainer = document.getElementById('geometryList');
    if (!listContainer) return;
    
    const geometries = this.generator.getSceneConfig().geometries;
    
    if (geometries.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">暂无几何体</div>';
      return;
    }

    listContainer.innerHTML = geometries.map((geo: any, index: number) => `
      <div class="geometry-item">
        <div class="geometry-info">
          <div class="geometry-name">${geo.name}</div>
          <div class="geometry-details">${geo.type} @ [${geo.position.join(', ')}]</div>
        </div>
        <button class="delete-btn btn btn-danger btn-small" data-index="${index}">删除</button>
      </div>
    `).join('');

    // 为所有删除按钮添加事件监听器
    const deleteButtons = listContainer.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const index = parseInt(target.getAttribute('data-index') || '0');
        console.log('删除按钮被点击，索引:', index);
        this.removeGeometry(index);
      });
    });
  }

  private updateSceneInfo(): void {
    const infoContainer = document.getElementById('sceneInfo');
    if (!infoContainer) return;
    
    const geometries = this.generator.getSceneConfig().geometries;
    const sceneConfig = this.generator.getSceneConfig();
    
    infoContainer.innerHTML = `
      几何体数量: ${geometries.length}<br>
      场景名称: ${sceneConfig.name}<br>
      最后更新: ${new Date().toLocaleTimeString()}
    `;
  }

  public async removeGeometry(index: number): Promise<void> {
    console.log(`尝试删除几何体 ${index}`);
    console.log('删除前的几何体列表:', this.generator.getSceneConfig().geometries);
    
    this.generator.removeGeometry(index);
    
    console.log('删除后的几何体列表:', this.generator.getSceneConfig().geometries);
    
    await this.reloadGeometries();
    this.updateGeometryList();
    this.updateSceneInfo();
    console.log(`几何体 ${index} 已删除`);
  }

  public show(): void {
    this.panel.style.display = 'block';
  }

  public hide(): void {
    this.panel.style.display = 'none';
  }

  public toggle(): void {
    this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
  }

  private async clearScene(): Promise<void> {
    if (confirm('确定要清空整个场景吗？这将移除所有几何体。')) {
      // 清空生成器中的几何体
      this.generator.clearGeometries();
      
      // 清空场景中的所有网格
      const scene = this.viewer.getRenderer().scene;
      const meshesToRemove: any[] = [];
      
      scene.traverse((child: any) => {
        if (child.type === 'Mesh' && child.name !== 'triangle.obj') {
          meshesToRemove.push(child);
        }
      });
      
      // 移除所有用户创建的网格
      meshesToRemove.forEach(mesh => {
        scene.remove(mesh);
        try {
          if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
            mesh.geometry.dispose();
          }
          if (mesh.material && typeof mesh.material.dispose === 'function') {
            mesh.material.dispose();
          }
        } catch (error) {
          console.warn('清理网格资源时出错:', error);
        }
      });
      
      // 强制更新渲染 - 使用多种方法确保更新
      try {
        // 延迟渲染更新，确保 DOM 更新完成
        setTimeout(() => {
          // 方法1: 直接渲染
          this.viewer.getRenderer().render(this.viewer.getRenderer().scene, this.viewer.getRenderer().camera);
          
          // 方法2: 通知 viewer 场景发生变化
          if (this.viewer.requestRender) {
            this.viewer.requestRender();
          }
          
          // 方法3: 强制重新渲染
          if (this.viewer.getRenderer() && this.viewer.getRenderer().render) {
            this.viewer.getRenderer().render(
              this.viewer.getRenderer().scene, 
              this.viewer.getRenderer().camera
            );
          }
          
          // 方法4: 使用 Speckle Viewer 的特定方法
          if (this.viewer.invalidate) {
            this.viewer.invalidate();
          }
          
          // 方法5: 触发 resize 事件来强制重新渲染
          window.dispatchEvent(new Event('resize'));
        }, 0);
      } catch (error) {
        console.warn('强制渲染更新时出错:', error);
      }
      
      // 更新界面
      this.updateGeometryList();
      this.updateSceneInfo();
      
      console.log('场景已清空');
    }
  }

  private showBatchImportModal(): void {
    console.log('showBatchImportModal 被调用');
    const modal = document.getElementById('batchImportModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'block';
      console.log('模态框已显示');
      
      // 在显示后重新绑定事件
      setTimeout(() => {
        this.bindModalEvents();
      }, 100);
    } else {
      console.error('模态框元素未找到');
    }
  }

  private exportData(): void {
    const geometries = this.generator.getSceneConfig().geometries;
    if (geometries.length === 0) {
      alert('没有几何体数据可以导出');
      return;
    }

    // 导出为 JSON 格式
    const exportData = {
      scene: this.generator.getSceneConfig(),
      geometries: geometries,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `geometry_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
    
    console.log('数据已导出:', exportData);
  }

  private bindModalEvents(): void {
    console.log('bindModalEvents 开始执行');
    const modal = document.getElementById('batchImportModal') as HTMLElement;
    if (!modal) {
      console.error('模态框元素未找到');
      return;
    }

    console.log('开始绑定模态框事件');

    // 关闭按钮
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    if (closeBtn) {
      closeBtn.onclick = () => {
        console.log('关闭按钮被点击');
        modal.style.display = 'none';
      };
      console.log('关闭按钮事件已绑定');
    } else {
      console.error('关闭按钮未找到');
    }

    // 取消按钮
    const cancelBtn = modal.querySelector('#cancelImport') as HTMLButtonElement;
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        console.log('取消按钮被点击');
        modal.style.display = 'none';
      };
      console.log('取消按钮事件已绑定');
    } else {
      console.error('取消按钮未找到');
    }

    // 点击模态框外部关闭
    modal.onclick = (e) => {
      if (e.target === modal) {
        console.log('点击模态框外部，关闭模态框');
        modal.style.display = 'none';
      }
    };

    // 导入按钮
    const importBtn = modal.querySelector('#importBtn') as HTMLButtonElement;
    if (importBtn) {
      console.log('找到导入按钮，绑定点击事件');
      importBtn.onclick = () => {
        console.log('导入按钮被点击');
        this.handleImport();
      };
      console.log('导入按钮事件已绑定');
    } else {
      console.error('导入按钮未找到');
    }
  }

  private async handleImport(): Promise<void> {
    console.log('handleImport 方法被调用');
    
    const modal = document.getElementById('batchImportModal') as HTMLElement;
    if (!modal) {
      console.error('模态框未找到');
      return;
    }
    
    const csvInput = modal.querySelector('#csvInput') as HTMLTextAreaElement;
    if (!csvInput) {
      console.error('CSV输入框未找到');
      alert('CSV输入框未找到');
      return;
    }
    
    console.log('CSV输入框内容:', csvInput.value);
    
    if (!csvInput.value.trim()) {
      alert('请输入有效的 CSV 数据');
      return;
    }

    try {
      console.log('开始解析CSV数据');
      const geometries = this.parseCsvData(csvInput.value);
      console.log('CSV解析成功:', geometries);
      
      if (geometries.length === 0) {
        alert('没有找到有效的几何体数据');
        return;
      }
      
      this.generator.clearGeometries();
      console.log('已清空现有几何体');

      let importedCount = 0;
      
      console.log('开始导入几何体');
      for (const geo of geometries) {
        const config = this.parseCsvGeometry(geo);
        this.generator.addGeometry(config);
        importedCount++;
        console.log(`成功导入几何体: ${config.name}`);
      }

      console.log(`总共导入 ${importedCount} 个几何体`);
      
      console.log('开始重新加载几何体');
      await this.reloadGeometries();
      console.log('几何体重新加载完成');
      
      this.updateGeometryList();
      this.updateSceneInfo();
      
      // 关闭模态框
      modal.style.display = 'none';
      
      alert(`成功导入 ${importedCount} 个几何体`);
      
    } catch (error) {
      console.error('导入失败:', error);
      alert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private parseCsvData(csv: string): any[] {
    const lines = csv.trim().split('\n');
    const data: any[] = [];

    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 9) {
        const name = parts[0] || `导入的${parts[1] || 'geometry'}_${i}`;
        const type = parts[1];
        const position_x = parseFloat(parts[2]) || 0;
        const position_y = parseFloat(parts[3]) || 0;
        const position_z = parseFloat(parts[4]) || 0;
        const size_x = parseFloat(parts[5]) || 1;
        const size_y = parseFloat(parts[6]) || 1;
        const size_z = parseFloat(parts[7]) || 0;
        const color = parts[8];

        data.push({
          name,
          type,
          position: [position_x, position_y, position_z],
          size: [size_x, size_y, size_z],
          color
        });
      }
    }

    return data;
  }

  private parseCsvGeometry(geo: any): any {
    const type = geo.type || 'triangle';
    const position = Array.isArray(geo.position) ? geo.position : [0, 0, 0];
    const size = Array.isArray(geo.size) ? geo.size : [1, 1, 0];
    // color 兼容 #RRGGBB 字符串或 RGB 数组
    let color: number[] = [255, 0, 0];
    if (typeof geo.color === 'string' && geo.color.startsWith('#') && geo.color.length === 7) {
      color = [
        parseInt(geo.color.slice(1, 3), 16),
        parseInt(geo.color.slice(3, 5), 16),
        parseInt(geo.color.slice(5, 7), 16)
      ];
    } else if (Array.isArray(geo.color) && geo.color.length === 3) {
      color = geo.color;
    }
    const name = geo.name || `导入的${type}_${Date.now()}`;

    return {
      type: type as any,
      position: position,
      size: size,
      color: color,
      name: name,
      description: geo.description || `从 CSV 导入的 ${type}`,
      properties: {
        source: 'csv_import',
        timestamp: Date.now().toString(),
        original_data: geo
      }
    };
  }

  public async handleImportDirect(): Promise<void> {
    console.log('handleImportDirect 被调用');
    await this.handleImport();
  }
} 