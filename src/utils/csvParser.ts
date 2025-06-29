/**
 * CSV 解析工具
 * 
 * 用于解析 CSV 文件并转换为 JavaScript 对象数组
 * 符合 Speckle Excel 集成标准
 */

export interface CsvRow {
  id: string;
  speckle_type: string;
  applicationId: string;
  name?: string;
  description?: string;
  vertices: string;
  faces: string;
  colors: string;
  bbox_min: string;
  bbox_max: string;
  area: number;
  volume: number;
  units: string;
  transform_matrix?: string;
  material?: string;
  properties?: string;
}

/**
 * 解析属性字符串为对象
 */
export function parseProperties(propertiesString: string): Record<string, string> {
  if (!propertiesString) return {};
  
  const properties: Record<string, string> = {};
  const pairs = propertiesString.split(',');
  
  for (const pair of pairs) {
    const [key, value] = pair.split(':');
    if (key && value) {
      properties[key.trim()] = value.trim();
    }
  }
  
  return properties;
}

/**
 * 解析 CSV 字符串为对象数组
 */
export function parseCsv(csvString: string): CsvRow[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  const headers = parseCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} values, expected ${headers.length}`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    // 转换数值类型
    if (row.area) row.area = parseFloat(row.area);
    if (row.volume) row.volume = parseFloat(row.volume);

    rows.push(row as CsvRow);
  }

  return rows;
}

/**
 * 解析单行 CSV
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * 从文件 URL 加载 CSV 数据
 */
export async function loadCsvFromUrl(url: string): Promise<CsvRow[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCsv(csvText);
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

/**
 * 验证 CSV 数据格式
 */
export function validateCsvData(rows: CsvRow[]): boolean {
  for (const row of rows) {
    if (!row.id || !row.speckle_type || !row.vertices || !row.faces) {
      console.error('Invalid CSV row:', row);
      return false;
    }
  }
  return true;
}

/**
 * 创建 Speckle 对象
 */
export function createSpeckleObject(row: CsvRow): any {
  const speckleObject: any = {
    id: row.id,
    speckle_type: row.speckle_type,
    applicationId: row.applicationId,
    name: row.name,
    description: row.description,
    vertices: parseArray(row.vertices),
    faces: parseArray(row.faces),
    colors: parseArray(row.colors),
    bbox: {
      min: parseArray(row.bbox_min),
      max: parseArray(row.bbox_max)
    },
    area: row.area,
    volume: row.volume,
    units: row.units,
    material: row.material,
    properties: parseProperties(row.properties || '')
  };

  if (row.transform_matrix) {
    speckleObject.transform = {
      speckle_type: "Objects.Other.Transform",
      matrix: parseArray(row.transform_matrix)
    };
  }

  return speckleObject;
}

/**
 * 解析字符串数组为数字数组
 */
function parseArray(arrayString: string): number[] {
  if (!arrayString) return [];
  return arrayString.split(',').map(s => parseFloat(s.trim()));
} 