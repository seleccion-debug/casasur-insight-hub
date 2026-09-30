import type { RespuestaEncuesta } from './types';
import { VARIABLES, HOTELS, SECTORS } from './constants';

// --- CSV parsing (handles quoted fields, commas inside quotes, newlines inside quotes) ---

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSVText(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else if (char === '\r' && !inQuotes) {
      // skip carriage return
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Last field/row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((r) => r.some((f) => f.length > 0));
}

// --- Normalization for fuzzy header matching ---

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Likert text-to-number mapping ---

const LIKERT_TEXT_MAP: Record<string, number> = {
  'muy en desacuerdo': 1,
  'en desacuerdo': 2,
  'neutral': 3,
  'ni de acuerdo ni en desacuerdo': 3,
  'de acuerdo': 4,
  'muy de acuerdo': 5,
  'muy malo': 1,
  'malo': 2,
  'regular': 3,
  'bueno': 4,
  'excelente': 5,
};

function parseLikertValue(raw: string): number | null {
  if (!raw || raw.trim() === '') return null;
  const trimmed = raw.trim();

  // Direct number
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 1 && num <= 5) return num;

  // Try text match
  const normalized = normalize(trimmed);
  for (const [text, value] of Object.entries(LIKERT_TEXT_MAP)) {
    if (normalized === normalize(text)) return value;
  }

  // Try extracting a leading number (e.g. "1 - Muy en desacuerdo")
  const match = trimmed.match(/^(\d)/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 5) return n;
  }

  return null;
}

// --- Build header-to-column mapping ---

interface ColumnMapping {
  csvIndex: number;
  dbKey: string;
}

function buildHeaderMapping(headers: string[]): {
  mapping: ColumnMapping[];
  hotelIdx: number;
  sectorIdx: number;
  nombreIdx: number;
  periodoIdx: number;
  beneficiosIdx: number;
  comentariosIdx: number;
} {
  const mapping: ColumnMapping[] = [];
  let hotelIdx = -1;
  let sectorIdx = -1;
  let nombreIdx = -1;
  let periodoIdx = -1;
  let beneficiosIdx = -1;
  let comentariosIdx = -1;

  // Collect all question keys with their text labels for fuzzy matching
  const questionLabels: { key: string; normalized: string }[] = [];
  VARIABLES.forEach((v) => {
    v.questions.forEach((q) => {
      questionLabels.push({ key: q.key, normalized: normalize(q.label) });
    });
  });

  headers.forEach((header, idx) => {
    const normHeader = normalize(header);

    // Direct db key match
    const directKey = questionLabels.find((q) => q.key === header.trim());
    if (directKey) {
      mapping.push({ csvIndex: idx, dbKey: directKey.key });
      return;
    }

    // Hotel
    if (hotelIdx === -1 && (normHeader === 'hotel' || normHeader.includes('hotel'))) {
      hotelIdx = idx;
      return;
    }

    // Sector
    if (sectorIdx === -1 && (normHeader === 'sector' || normHeader.includes('sector'))) {
      sectorIdx = idx;
      return;
    }

    // Nombre
    if (nombreIdx === -1 && (normHeader.includes('nombre') || normHeader.includes('name'))) {
      nombreIdx = idx;
      return;
    }

    // Periodo
    if (periodoIdx === -1 && (normHeader.includes('periodo') || normHeader.includes('period'))) {
      periodoIdx = idx;
      return;
    }

    // Beneficios
    if (beneficiosIdx === -1 && normHeader.includes('beneficio')) {
      beneficiosIdx = idx;
      return;
    }

    // Comentarios
    if (comentariosIdx === -1 && (normHeader.includes('comentario') || normHeader.includes('observacion'))) {
      comentariosIdx = idx;
      return;
    }

    // Fuzzy match question text
    const matched = questionLabels.find((q) => {
      if (normHeader === q.normalized) return true;
      // Partial match: header contains the question text or vice versa
      if (normHeader.length > 10 && q.normalized.length > 10) {
        if (normHeader.includes(q.normalized) || q.normalized.includes(normHeader)) return true;
      }
      return false;
    });

    if (matched) {
      mapping.push({ csvIndex: idx, dbKey: matched.key });
    }
  });

  return { mapping, hotelIdx, sectorIdx, nombreIdx, periodoIdx, beneficiosIdx, comentariosIdx };
}

// --- Hotel/sector normalization ---

function normalizeHotel(raw: string): string {
  if (!raw) return '';
  const norm = normalize(raw);
  for (const h of HOTELS) {
    if (normalize(h) === norm || norm.includes(normalize(h))) return h;
  }
  // Legacy alias: "Corporativo/General" -> "Hotel Collection"
  if (norm.includes('corporativo') || norm.includes('general')) return 'Hotel Collection';
  return raw.trim();
}

function normalizeSector(raw: string): string {
  if (!raw) return '';
  const norm = normalize(raw);
  for (const s of SECTORS) {
    if (normalize(s) === norm || norm.includes(normalize(s)) || normalize(s).includes(norm)) return s;
  }
  // Common aliases
  if (norm.includes('front') || norm.includes('recepcion')) return 'Front';
  if (norm.includes('house') || norm.includes('limpieza')) return 'Housekeeping';
  if (norm.includes('admin')) return 'Administración';
  if (norm.includes('rrhh') || norm.includes('recursos')) return 'RRHH';
  if (norm.includes('comer')) return 'Comercial';
  if (norm.includes('geren')) return 'Gerencia';
  if (norm.includes('segur')) return 'Seguridad';
  if (norm.includes('aliment') || norm.includes('bebida') || norm.includes('a y b')) return 'Alimentos y Bebidas';
  if (norm.includes('mante')) return 'Mantenimiento';
  return raw.trim();
}

// --- Main parse function ---

export interface CSVImportResult {
  respuestas: RespuestaEncuesta[];
  totalRows: number;
  skipped: number;
  errors: string[];
}

export function parseCSVToRespuestas(
  csvText: string,
  defaultPeriodo: string
): CSVImportResult {
  const rows = parseCSVText(csvText);
  const result: CSVImportResult = {
    respuestas: [],
    totalRows: 0,
    skipped: 0,
    errors: [],
  };

  if (rows.length < 2) {
    result.errors.push('El archivo CSV no contiene datos suficientes (se requiere al menos una fila de encabezados y una de datos).');
    return result;
  }

  const headers = rows[0];
  const {
    mapping,
    hotelIdx,
    sectorIdx,
    nombreIdx,
    periodoIdx,
    beneficiosIdx,
    comentariosIdx,
  } = buildHeaderMapping(headers);

  if (hotelIdx === -1) {
    result.errors.push('No se encontró la columna "Hotel" en el CSV.');
  }
  if (sectorIdx === -1) {
    result.errors.push('No se encontró la columna "Sector" en el CSV.');
  }
  if (mapping.length === 0) {
    result.errors.push('No se pudieron mapear las columnas de preguntas a las variables de la encuesta.');
  }

  if (result.errors.length > 0) return result;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    result.totalRows++;

    const hotel = hotelIdx >= 0 ? normalizeHotel(row[hotelIdx] ?? '') : '';
    const sector = sectorIdx >= 0 ? normalizeSector(row[sectorIdx] ?? '') : '';

    if (!hotel || !sector) {
      result.skipped++;
      result.errors.push(`Fila ${i + 1}: Hotel o sector vacío. Fila omitida.`);
      continue;
    }

    const periodo = periodoIdx >= 0 && row[periodoIdx]?.trim() ? row[periodoIdx].trim() : defaultPeriodo;
    const nombre = nombreIdx >= 0 ? (row[nombreIdx]?.trim() || null) : null;
    const beneficios = beneficiosIdx >= 0 ? (row[beneficiosIdx]?.trim() || null) : null;
    const comentarios = comentariosIdx >= 0 ? (row[comentariosIdx]?.trim() || null) : null;

    const respuesta: RespuestaEncuesta = {
      hotel,
      sector,
      nombre_completo: nombre,
      periodo,
      com_beneficios_deseados: beneficios,
      comentarios_observaciones: comentarios,
    };

    let hasAnyScore = false;
    for (const col of mapping) {
      const rawValue = row[col.csvIndex] ?? '';
      const score = parseLikertValue(rawValue);
      if (score !== null) hasAnyScore = true;
      (respuesta as unknown as Record<string, unknown>)[col.dbKey] = score;
    }

    if (!hasAnyScore) {
      result.skipped++;
      result.errors.push(`Fila ${i + 1}: No se encontraron puntuaciones válidas. Fila omitida.`);
      continue;
    }

    result.respuestas.push(respuesta);
  }

  return result;
}
