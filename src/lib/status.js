const BILL_UNUSED_PHRASES = [
  'ยังไม่ได้ใช้',
  'ยังไม่ใช้',
  'ไม่ได้ใช้',
  'ไม่ใช้',
  'not used',
  'unused',
]

const BILL_USED_PHRASES = [
  'ใช้บิลมัดจำไปแล้ว',
  'ใช้บิลมัดจำแล้ว',
  'ใช้บิลมัดจำ',
  'ใช้ใบมัดจำไปแล้ว',
  'ใช้ใบมัดจำแล้ว',
  'ใช้ใบมัดจำ',
  'ใช้บิลแล้ว',
  'ใช้แล้ว',
  'used',
]

const PRODUCT_NOT_ARRIVED_PHRASES = [
  'ยังไม่เข้า',
  'ยังไม่มีสินค้า',
  'ยังไม่มีข้อมูล',
  'ไม่มีข้อมูล',
  'สินค้าไม่เข้า',
  'ของยังไม่เข้า',
  'รอสินค้า',
  'รอของ',
  'out of stock',
  'pending',
]

const PRODUCT_ARRIVED_PHRASES = [
  'ของเข้าแล้ว',
  'สินค้าเข้าแล้ว',
  'ของเข้า',
  'สินค้าเข้า',
  'สินค้าถึงแล้ว',
  'สินค้าถึงเเล้ว',
  'สินค้าเข้ามาแล้ว',
  'ของมาถึงแล้ว',
  'เข้าแล้ว',
  'พร้อมส่ง',
  'พร้อมรับ',
  'มีสินค้า',
  'in stock',
  'received',
  'arrived',
]

const CALL_NOT_COMPLETE_PHRASES = [
  'ยังไม่ได้โทร',
  'ยังไม่โทร',
  'ไม่ได้โทร',
  'ไม่โทร',
  'not called',
]

export const normaliseStatusText = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

export const hasStatusValue = (value) => normaliseStatusText(value) !== ''

const includesStatusPhrase = (value, phrases) => {
  const text = normaliseStatusText(value)
  return phrases.some((phrase) => text.includes(phrase))
}

export function getBillStatusTone(value) {
  if (!hasStatusValue(value)) return 'danger'
  if (includesStatusPhrase(value, BILL_UNUSED_PHRASES)) return 'danger'
  if (includesStatusPhrase(value, BILL_USED_PHRASES)) return 'success'
  return 'danger'
}

export function getProductStatusTone(value) {
  if (!hasStatusValue(value)) return 'danger'
  if (includesStatusPhrase(value, PRODUCT_NOT_ARRIVED_PHRASES)) return 'danger'
  return 'info'
}

export function isBillUsed(value) {
  return hasStatusValue(value)
    && !includesStatusPhrase(value, BILL_UNUSED_PHRASES)
    && includesStatusPhrase(value, BILL_USED_PHRASES)
}

export function isBillUnused(value) {
  return hasStatusValue(value) && includesStatusPhrase(value, BILL_UNUSED_PHRASES)
}

export function isProductArrived(value) {
  return hasStatusValue(value)
    && !includesStatusPhrase(value, PRODUCT_NOT_ARRIVED_PHRASES)
    && includesStatusPhrase(value, PRODUCT_ARRIVED_PHRASES)
}

export function isCallComplete(value) {
  return hasStatusValue(value) && !includesStatusPhrase(value, CALL_NOT_COMPLETE_PHRASES)
}
