export const WORKFLOW_STORAGE_KEY = 'npi-stock-followup-workflow-v1'
export const STOCK_ROWS_STORAGE_KEY = 'npi-stock-followup-source-v1'

const seedNow = new Date()

const thaiDateTime = new Intl.DateTimeFormat('th-TH', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const normalise = (value = '') => String(value).trim().toLowerCase().replace(/\s+/g, ' ')

export function formatStockDate(date = new Date()) {
  return thaiDateTime.format(date)
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function seedHistory({ called, reserved, callMinutes = -48, reserveMinutes = -16 }) {
  const createdAt = addMinutes(seedNow, -86)
  const history = [{
    type: 'created',
    label: 'สร้างรายการ',
    at: formatStockDate(createdAt),
    by: 'ระบบ',
    detail: 'รอติดต่อ',
  }]

  if (called) {
    history.unshift({
      type: 'called',
      label: 'โทรแล้ว',
      at: formatStockDate(addMinutes(seedNow, callMinutes)),
      by: 'กมล สายดี',
      detail: 'ลูกค้ายืนยันรับของ',
    })
  }

  if (reserved) {
    history.unshift({
      type: 'reserved',
      label: 'เก็บของแล้ว',
      at: formatStockDate(addMinutes(seedNow, reserveMinutes)),
      by: 'กมล สายดี',
      detail: 'เก็บของเข้าช่อง A3',
    })
  }

  return history
}

function seedRow(data) {
  const history = seedHistory(data)
  return {
    channel: 'หน้าร้าน (Walk-in)',
    customer: 'ยังไม่มีข้อมูลลูกค้า',
    phone: '-',
    shelf: 'รอระบุ',
    note: '',
    ...data,
    updatedAt: history[0]?.at ?? formatStockDate(),
    history,
  }
}

export const INITIAL_STOCK_ROWS = [
  seedRow({ order: 'OD241024-001', product: 'iPhone 15 128GB (Black)', quantity: 1, stock: 5, customer: 'คุณณัฐพล อินทร์ชัย', phone: '081-234-5678', shelf: 'A3', called: true, reserved: true, callMinutes: -48, reserveMinutes: -16 }),
  seedRow({ order: 'OD241024-002', product: 'Samsung Galaxy S24 256GB (Gray)', quantity: 1, stock: 0, customer: 'คุณพิมพ์ชนก', phone: '089-345-6789', called: false, reserved: false }),
  seedRow({ order: 'OD241024-003', product: 'OPPO Reno11 5G (เขียว)', quantity: 1, stock: 3, customer: 'คุณธนกฤต', phone: '086-456-7890', shelf: 'B1', called: true, reserved: false, callMinutes: -34 }),
  seedRow({ order: 'OD241024-004', product: 'vivo V30 5G (ดำ)', quantity: 1, stock: 2, customer: 'คุณศิริพร', phone: '082-567-8901', called: false, reserved: false }),
  seedRow({ order: 'OD241024-005', product: 'iPad Air 6 11" 256GB (ฟ้า)', quantity: 1, stock: 4, customer: 'คุณกัญญารัตน์', phone: '094-678-9012', shelf: 'C2', called: true, reserved: true, callMinutes: -52, reserveMinutes: -28 }),
  seedRow({ order: 'OD241024-006', product: 'Apple Watch Series 9 (GPS) 41mm', quantity: 1, stock: 1, customer: 'คุณวราภรณ์', phone: '095-789-0123', shelf: 'D1', called: true, reserved: false, callMinutes: -20 }),
  seedRow({ order: 'OD241024-007', product: 'AirPods Pro (รุ่นที่ 2)', quantity: 2, stock: 6, customer: 'คุณภูวดล', phone: '080-890-1234', called: false, reserved: false }),
  seedRow({ order: 'OD241024-008', product: 'Samsung Galaxy Buds FE (ขาว)', quantity: 1, stock: 0, customer: 'คุณอรพรรณ', phone: '081-901-2345', called: false, reserved: false }),
  seedRow({ order: 'OD241024-009', product: 'Power Bank Anker 10000mAh (ดำ)', quantity: 2, stock: 12, customer: 'คุณชยพล', phone: '083-012-3456', shelf: 'E4', called: true, reserved: true, callMinutes: -40, reserveMinutes: -24 }),
  seedRow({ order: 'OD241024-010', product: 'สายชาร์จ USB-C to Lightning (1M)', quantity: 3, stock: 25, customer: 'คุณภัทรวดี', phone: '084-123-4567', shelf: 'E2', called: true, reserved: true, callMinutes: -39, reserveMinutes: -21 }),
  seedRow({ order: 'OD241024-011', product: 'หัวชาร์จเร็ว 20W (USB-C) Apple', quantity: 1, stock: 8, customer: 'คุณพีรพล', phone: '085-234-5678', called: false, reserved: false }),
  seedRow({ order: 'OD241024-012', product: 'เคส iPhone 15 (ใส)', quantity: 3, stock: 15, customer: 'คุณสุภาวดี', phone: '087-345-6789', shelf: 'F1', called: true, reserved: false, callMinutes: -12 }),
  seedRow({ order: 'OD241024-013', product: 'ฟิล์มกระจก iPhone 15 (2ชิ้น)', quantity: 2, stock: 20, customer: 'คุณนฤมล', phone: '088-456-7890', called: false, reserved: false }),
  seedRow({ order: 'OD241024-014', product: 'เคส Samsung S24 (ดำ)', quantity: 1, stock: 5, customer: 'คุณเอกภพ', phone: '090-567-8901', shelf: 'F3', called: true, reserved: true, callMinutes: -30, reserveMinutes: -8 }),
]

export function readWorkflowState() {
  try {
    const raw = window.localStorage.getItem(WORKFLOW_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function writeWorkflowState(rows) {
  try {
    const workflow = Object.fromEntries(rows.map((row) => [row.order, {
      called: Boolean(row.called),
      reserved: Boolean(row.reserved),
      note: row.note ?? '',
      updatedAt: row.updatedAt,
      history: row.history ?? [],
    }]))
    window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflow))
  } catch {
    // The UI remains usable if browser storage is unavailable.
  }
}

export function readStockRows() {
  try {
    const raw = window.localStorage.getItem(STOCK_ROWS_STORAGE_KEY)
    const rows = raw ? JSON.parse(raw) : []
    return Array.isArray(rows) && rows.length > 0 ? rows : null
  } catch {
    return null
  }
}

export function writeStockRows(rows) {
  try {
    window.localStorage.setItem(STOCK_ROWS_STORAGE_KEY, JSON.stringify(rows))
  } catch {
    // The UI remains usable if browser storage is unavailable.
  }
}

export function mergeWorkflow(rows, workflow = readWorkflowState()) {
  return rows.map((row) => ({
    ...row,
    ...(workflow[row.order] ?? {}),
    history: workflow[row.order]?.history ?? row.history ?? [],
  }))
}

const HEADER_ALIASES = {
  order: ['order no', 'order', 'เลขออเดอร์', 'เลขออเดอร์/เลขจอง', 'เลขจอง', 'booking number'],
  product: ['สินค้า', 'product', 'ชื่อสินค้า', 'product name'],
  productStatus: ['สถานะสินค้า', 'product status', 'status'],
  quantity: ['จำนวน', 'qty', 'quantity'],
  stock: ['stock', 'คงเหลือ', 'จำนวนคงเหลือ', 'สต็อก'],
  customer: ['ลูกค้า', 'customer', 'ชื่อลูกค้า', 'ชื่อ'],
  phone: ['เบอร์โทร', 'โทรศัพท์', 'phone', 'mobile'],
  employee: ['พนักงาน', 'employee', 'staff'],
  billStatus: ['สถานะบิลมัดจำ', 'สถานะบิล', 'bill status'],
  callStatus: ['โทรตามลูกค้า', 'โทรแล้ว', 'สถานะการโทร', 'call status', 'called'],
  callDate: ['Date Call', 'วันที่โทร', 'วันที่เจ้าหน้าที่โทรไป', 'call date', 'called at'],
  comment: ['Comment', 'คอมเมนต์', 'ความคิดเห็นลูกค้า', 'ความคิดเห็น', 'comment', 'note'],
}

function findColumn(headers, aliases) {
  return headers.findIndex((header) => aliases.some((alias) => normalise(alias) === normalise(header)))
}

function numberFromCell(value, fallback = 0) {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseDelimited(text) {
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.includes('\t') ? '\t' : ','
    return line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, ''))
  })
}

export function parseStockImport(text) {
  const trimmed = text.trim()
  if (!trimmed) return []

  try {
    const json = JSON.parse(trimmed)
    const list = Array.isArray(json) ? json : Array.isArray(json.rows) ? json.rows : []
    return list.map((item) => normaliseImportedRow(item)).filter((row) => row.order)
  } catch {
    const matrix = parseDelimited(trimmed)
    if (matrix.length < 2) return []
    const headers = matrix[0]
    const indexes = Object.fromEntries(Object.entries(HEADER_ALIASES).map(([key, aliases]) => [key, findColumn(headers, aliases)]))
    if (indexes.order < 0) return []
    return matrix.slice(1).map((values) => normaliseImportedRow({
      order: values[indexes.order],
      product: values[indexes.product],
      productStatus: values[indexes.productStatus],
      quantity: values[indexes.quantity],
      stock: values[indexes.stock],
      customer: values[indexes.customer],
      phone: values[indexes.phone],
      employee: values[indexes.employee],
      billStatus: values[indexes.billStatus],
      callStatus: values[indexes.callStatus],
      callDate: values[indexes.callDate],
      comment: values[indexes.comment],
    })).filter((row) => row.order)
  }
}

function normaliseImportedRow(item = {}) {
  return {
    order: String(item.order ?? item.orderNo ?? item['Order No'] ?? '').trim(),
    product: String(item.product ?? item.productName ?? item['สินค้า'] ?? 'ไม่ระบุสินค้า').trim(),
    productStatus: String(item.productStatus ?? item['สถานะสินค้า'] ?? '').trim(),
    quantity: numberFromCell(item.quantity ?? item.qty ?? item['จำนวน'], 1),
    stock: numberFromCell(item.stock ?? item.inventory ?? item['Stock'] ?? item['คงเหลือ'], 0),
    customer: String(item.customer ?? item['ลูกค้า'] ?? 'ยังไม่มีข้อมูลลูกค้า').trim(),
    phone: String(item.phone ?? item.mobile ?? item['เบอร์โทร'] ?? '-').trim(),
    employee: String(item.employee ?? item['พนักงาน'] ?? '').trim(),
    billStatus: String(item.billStatus ?? item['สถานะบิลมัดจำ'] ?? '').trim(),
    callStatus: String(item.callStatus ?? item['โทรตามลูกค้า'] ?? item['โทรแล้ว'] ?? '').trim(),
    callDate: String(item.callDate ?? item['Date Call'] ?? item['วันที่โทร'] ?? '').trim(),
    comment: String(item.comment ?? item['Comment'] ?? item['ความคิดเห็น'] ?? '').trim(),
  }
}

export function mergeImportedRows(currentRows, importedRows) {
  const importedByOrder = new Map(importedRows.map((row) => [row.order, row]))
  const existingOrders = new Set(currentRows.map((row) => row.order))
  const updated = currentRows.map((row) => importedByOrder.has(row.order) ? {
    ...row,
    ...importedByOrder.get(row.order),
    updatedAt: row.updatedAt,
  } : row)

  importedRows.forEach((row) => {
    if (!existingOrders.has(row.order)) {
      updated.push({
        ...row,
        channel: 'นำเข้าจากหน้า Stock',
        shelf: 'รอระบุ',
        called: false,
        reserved: false,
        note: '',
        updatedAt: formatStockDate(),
        history: [{ type: 'created', label: 'นำเข้ารายการ', at: formatStockDate(), by: 'ผู้ใช้งาน', detail: 'รอติดต่อ' }],
      })
    }
  })

  return updated
}
