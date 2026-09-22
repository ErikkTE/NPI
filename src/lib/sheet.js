export const SHEET_ID = '1TvcW3pddgxs3ubZz83yY7nL7Sxux9Utmcycwdeuo5Pc'
export const SHEET_TAB_NAME = 'USE'
export const SHEET_GID = '1128669720'

export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
export const SHEET_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_TAB_NAME)}`

// รหัสจากคอลัมน์ "พนักงาน" ในแท็บ USE และชื่อที่แสดงในภาพรายชื่อพนักงาน
export const EMPLOYEE_NAMES_BY_ID = Object.freeze({
  '18508': 'กาน',
  '31958': 'ขนุน',
  '26973': 'โจ้',
  '28937': 'เมย์',
  '29384': 'ชีต้า',
  '30976': 'ต้า',
  '31935': 'แพท',
  '32355': 'Linda',
  '32992': 'อั้ม',
  '32975': 'Martin',
})

export const FALLBACK_ROWS = [
  {
    billStatus: 'ตัวอย่างข้อมูล',
    order: 'DEMO-001',
    employee: 'STAFF-DEMO',
    productStatus: 'พร้อมตรวจสอบ',
    callStatus: '',
    callDate: '',
    comment: '',
  },
  {
    billStatus: 'ตัวอย่างข้อมูล',
    order: 'DEMO-002',
    employee: 'STAFF-DEMO',
    productStatus: 'สินค้าถึงแล้ว',
    callStatus: 'โทรแล้ว',
    callDate: 'ตัวอย่างวันที่',
    comment: 'ลูกค้ารับทราบแล้ว',
  },
  {
    billStatus: 'ตัวอย่างข้อมูล',
    order: 'DEMO-003',
    employee: '',
    productStatus: 'สินค้าถึงแล้ว',
    callStatus: '',
    callDate: '',
    comment: '',
  },
  {
    billStatus: 'ตัวอย่างข้อมูล',
    order: 'DEMO-004',
    employee: '',
    productStatus: 'รอตรวจสอบ',
    callStatus: '',
    callDate: '',
    comment: '',
  },
  {
    billStatus: 'ตัวอย่างข้อมูล',
    order: 'DEMO-005',
    employee: '',
    productStatus: 'รอตรวจสอบ',
    callStatus: '',
    callDate: '',
    comment: '',
  },
]

const HEADER_ALIASES = {
  billStatus: ['สถานะบิลมัดจำ', 'สถานะบิล', 'bill status'],
  order: ['เลขออเดอร์', 'เลขจอง', 'เลข booking', 'booking number', 'order number', 'order'],
  employee: ['พนักงาน', 'employee', 'staff'],
  owner: ['เป็นของใคร', 'ผู้จอง', 'ชื่อผู้จอง', 'ชื่อพนักงาน', 'พนักงาน', 'owner', 'customer', 'employee', 'staff'],
  productStatus: ['สถานะสินค้า', 'product status', 'status'],
  callStatus: ['โทรตามลูกค้า', 'โทรแล้ว', 'สถานะการโทร', 'สถานะโทร', 'โทรหาลูกค้า', 'call status', 'called'],
  callDate: ['Date Call', 'วันที่เจ้าหน้าที่โทรไป', 'วันที่โทร', 'วันที่โทรไป', 'วันที่โทรหาลูกค้า', 'call date', 'called at'],
  comment: ['Comment', 'คอมเมนต์', 'ความคิดเห็นลูกค้า', 'ความคิดเห็น', 'หมายเหตุลูกค้า', 'customer comment', 'comment', 'note'],
}

const cleanCell = (value = '') => String(value).replace(/^\uFEFF/, '').trim()

const normaliseHeader = (value = '') => cleanCell(value).toLowerCase().replace(/\s+/g, ' ')

const normaliseSearch = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[\s-]+/g, '')
    .trim()

const resolveEmployeeName = (value = '') => {
  const cleaned = cleanCell(value)
  if (!cleaned) return ''

  const employeeId = cleaned.replace(/^#\s*/, '')
  return EMPLOYEE_NAMES_BY_ID[employeeId] ?? cleaned
}

function findHeaderIndex(headers, aliases) {
  const normalisedHeaders = headers.map(normaliseHeader)
  return normalisedHeaders.findIndex((header) =>
    aliases.some((alias) => normaliseHeader(alias) === header),
  )
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += character
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    if (row.some((value) => value.trim() !== '')) rows.push(row)
  }

  return rows
}

export function mapSheetRows(matrix) {
  if (!Array.isArray(matrix) || matrix.length < 2) return []

  const headers = matrix[0].map(cleanCell)
  const indexes = {
    billStatus: findHeaderIndex(headers, HEADER_ALIASES.billStatus),
    order: findHeaderIndex(headers, HEADER_ALIASES.order),
    employee: findHeaderIndex(headers, HEADER_ALIASES.employee),
    owner: findHeaderIndex(headers, HEADER_ALIASES.owner),
    productStatus: findHeaderIndex(headers, HEADER_ALIASES.productStatus),
    callStatus: findHeaderIndex(headers, HEADER_ALIASES.callStatus),
    callDate: findHeaderIndex(headers, HEADER_ALIASES.callDate),
    comment: findHeaderIndex(headers, HEADER_ALIASES.comment),
  }

  if (indexes.order < 0) return []

  return matrix.slice(1).map((values) => ({
    billStatus: cleanCell(values[indexes.billStatus] ?? ''),
    order: cleanCell(values[indexes.order] ?? ''),
    employee: cleanCell(values[indexes.employee] ?? ''),
    owner: resolveEmployeeName(values[indexes.owner >= 0 ? indexes.owner : indexes.employee] ?? ''),
    productStatus: cleanCell(values[indexes.productStatus] ?? ''),
    callStatus: cleanCell(values[indexes.callStatus] ?? ''),
    callDate: cleanCell(values[indexes.callDate] ?? ''),
    comment: cleanCell(values[indexes.comment] ?? ''),
  })).filter((row) => row.order !== '')
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Sheet request failed: ${response.status}`)
  return response.text()
}

function parseGvizResponse(text) {
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace < firstBrace) return []

  const payload = JSON.parse(text.slice(firstBrace, lastBrace + 1))
  const table = payload?.table
  if (!table) return []

  const headers = (table.cols ?? []).map((column) => column.label ?? column.id ?? '')
  const rows = (table.rows ?? []).map((row) =>
    (row.c ?? []).map((cell) => cell?.f ?? cell?.v ?? ''),
  )

  return mapSheetRows([headers, ...rows])
}

export async function fetchSheetRows() {
  try {
    const csvRows = mapSheetRows(parseCsv(await fetchText(SHEET_CSV_URL)))
    if (csvRows.length > 0) return { rows: csvRows, source: 'csv' }
  } catch {
    // Try the Visualization endpoint below. It can work when CSV export is blocked.
  }

  const gvizRows = parseGvizResponse(await fetchText(SHEET_GVIZ_URL))
  if (gvizRows.length === 0) throw new Error('No booking rows found')
  return { rows: gvizRows, source: 'gviz' }
}

export function searchSheetRows(rows, query) {
  const term = normaliseSearch(query)
  if (!term) return []

  return rows.filter((row) => normaliseSearch(row.order).includes(term))
}

export function formatSyncTime(date) {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
