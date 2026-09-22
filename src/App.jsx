import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FALLBACK_ROWS,
  SHEET_TAB_NAME,
  fetchSheetRows,
  formatSyncTime,
  searchSheetRows,
} from './lib/sheet'

const FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSefKgnfXIoJOJ-aed-eUXkOKe1Rd-B5Y0SG4mxF2Lk7GGEvpA/viewform'

function SearchIcon({ size = 22 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="10.8" cy="10.8" r="6.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function XIcon({ size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m7.8 12.1 2.7 2.7 5.8-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AlertIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 7.2v5.1M12 16.3h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function RefreshIcon({ size = 19 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 11a8.1 8.1 0 0 0-14.9-3.8L3.2 9.1M3 5.1v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13a8.1 8.1 0 0 0 14.9 3.8l1.9-1.9M21 18.9v-4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FormIcon({ size = 24 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M7 3.75h10.2L21 7.55v16.7H7V3.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M17 3.9v4h4M10.5 13h7M10.5 17h7M10.5 9h2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalIcon({ size = 17 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon({ size = 23 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.2 19.3c.8-3.1 3-4.8 6.8-4.8s6 1.7 6.8 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ReceiptIcon({ size = 23 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.2 3.6h11.6v16.8l-2.2-1.4-1.8 1.4-1.8-1.4-1.8 1.4-1.8-1.4-2.2 1.4V3.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 8h6M9 11.7h6M9 15.4h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PackageIcon({ size = 23 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m4.5 7.2 7.5 4 7.5-4M12 11.2v8.5M5 6.3 12 3l7 3.3v10.4L12 21l-7-4.3V6.3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon({ size = 23 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.5 3.5 4 5c-.5.4-.7 1.1-.5 1.7 1.8 6.3 7 11.5 13.3 13.3.6.2 1.3 0 1.7-.5l1.5-2.5-4.3-2.1-1.5 1.7a14.4 14.4 0 0 1-5.8-5.8l1.7-1.5-2.1-4.3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon({ size = 23 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function CommentIcon({ size = 23 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7.5 10h9M7.5 13.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

const normaliseStatusText = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

const hasStatusValue = (value) => normaliseStatusText(value) !== ''

const includesStatusPhrase = (value, phrases) => {
  const text = normaliseStatusText(value)
  return phrases.some((phrase) => text.includes(phrase))
}

function getBillStatusTone(value) {
  if (!hasStatusValue(value)) return 'danger'
  if (includesStatusPhrase(value, ['ยังไม่ได้ใช้', 'ยังไม่ใช้', 'ไม่ได้ใช้', 'ไม่ใช้', 'not used', 'unused'])) return 'danger'
  if (includesStatusPhrase(value, ['ใช้บิลมัดจำไปแล้ว', 'ใช้บิลมัดจำแล้ว', 'ใช้บิลมัดจำ', 'ใช้ใบมัดจำไปแล้ว', 'ใช้ใบมัดจำแล้ว', 'ใช้ใบมัดจำ', 'ใช้บิลแล้ว', 'ใช้แล้ว', 'used'])) return 'success'
  return 'danger'
}

function getProductStatusTone(value) {
  if (!hasStatusValue(value)) return 'danger'
  if (includesStatusPhrase(value, ['ยังไม่เข้า', 'ยังไม่มีสินค้า', 'ยังไม่มีข้อมูล', 'ไม่มีข้อมูล', 'สินค้าไม่เข้า', 'ของยังไม่เข้า', 'รอสินค้า', 'รอของ', 'out of stock', 'pending'])) return 'danger'
  return 'info'
}

function isCallComplete(value) {
  return hasStatusValue(value) && !includesStatusPhrase(value, ['ยังไม่ได้โทร', 'ยังไม่โทร', 'ไม่ได้โทร', 'ไม่โทร', 'not called'])
}

function StatusBadge({ value, tone = 'neutral', emptyLabel = 'ยังไม่มีข้อมูล', className = '' }) {
  const hasValue = hasStatusValue(value)
  const resolvedTone = hasValue ? tone : 'danger'
  const label = hasValue ? value : emptyLabel

  return (
    <span className={`status-badge status-badge--${resolvedTone} ${className}`.trim()}>
      {resolvedTone === 'danger' ? <AlertIcon size={16} /> : resolvedTone !== 'neutral' && <CheckIcon size={16} />}
      {label}
    </span>
  )
}

function DetailItem({ icon: Icon, label, children, className = '' }) {
  return (
    <div className={`detail-item ${className}`}>
      <span className="detail-item__icon"><Icon size={23} /></span>
      <div className="detail-item__body">
        <span className="detail-item__label">{label}</span>
        <div className="detail-item__value">{children}</div>
      </div>
    </div>
  )
}

function BookingCard({ row }) {
  const owner = row.owner || row.employee || 'ยังไม่มีข้อมูล'

  return (
    <article className="booking-card">
      <div className="booking-card__summary">
        <div>
          <span className="field-label">เลขจอง</span>
          <strong className="booking-card__order">{row.order}</strong>
        </div>
        <span className="booking-card__source">แท็บ {SHEET_TAB_NAME}</span>
      </div>

      <div className="booking-details">
        <DetailItem icon={UserIcon} label="เป็นของใคร">
          <strong>{owner}</strong>
        </DetailItem>
        <DetailItem icon={ReceiptIcon} label="สถานะบิลมัดจำ">
          <StatusBadge value={row.billStatus} tone={getBillStatusTone(row.billStatus)} />
        </DetailItem>
        <DetailItem icon={PackageIcon} label="สถานะสินค้า">
          <StatusBadge value={row.productStatus} tone={getProductStatusTone(row.productStatus)} />
        </DetailItem>
        <DetailItem icon={PhoneIcon} label="สถานะการโทร">
          <StatusBadge value={isCallComplete(row.callStatus) ? 'โทรแล้ว' : 'ยังไม่โทร'} tone={isCallComplete(row.callStatus) ? 'success' : 'danger'} />
        </DetailItem>
        <DetailItem icon={CalendarIcon} label="วันที่โทร">
          <StatusBadge value={row.callDate} tone="success" />
        </DetailItem>
        <DetailItem icon={CommentIcon} label="Comment ลูกค้า" className="detail-item--comment">
          <StatusBadge value={row.comment} tone="success" className="status-badge--comment" />
        </DetailItem>
      </div>
    </article>
  )
}

function ResultPanel({ rows }) {
  return (
    <div className="results-panel" aria-live="polite">
      <div className="results-panel__heading">
        <span className="results-panel__icon"><CheckIcon size={26} /></span>
        <div>
          <strong>พบข้อมูลเลขจองในระบบ</strong>
          <span>อัปเดตล่าสุดจาก Google Sheet ({SHEET_TAB_NAME})</span>
        </div>
        <span className="results-panel__count">{rows.length} รายการ</span>
      </div>
      <div className="booking-list">
        {rows.map((row, index) => <BookingCard row={row} key={`${row.order}-${index}`} />)}
      </div>
    </div>
  )
}

function EmptyState({ type, onRetry }) {
  if (type === 'loading') {
    return (
      <div className="state-card state-card--loading" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <div>
          <strong>กำลังค้นหาข้อมูล...</strong>
          <p>กำลังตรวจสอบเลขจองจากแท็บ {SHEET_TAB_NAME}</p>
        </div>
      </div>
    )
  }

  if (type === 'not-found') {
    return (
      <div className="state-card state-card--error" aria-live="polite">
        <span className="state-card__icon"><AlertIcon size={23} /></span>
        <div>
          <strong>ไม่พบเลขจองนี้</strong>
          <p>ลองตรวจสอบตัวเลขอีกครั้ง หรือค้นหาด้วยเลขจองบางส่วน</p>
          <button type="button" className="retry-button" onClick={onRetry}>
            <RefreshIcon size={17} />
            ค้นหาอีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="state-card state-card--idle" aria-live="polite">
      <span className="state-card__icon"><SearchIcon size={25} /></span>
      <div>
        <strong>เริ่มค้นหาเลขจองได้เลย</strong>
        <p>กรอกเลขจองด้านบนเพื่อดูสถานะและชื่อพนักงานผู้รับผิดชอบ</p>
      </div>
    </div>
  )
}

function ConnectionStatus({ status, lastSync, onRefresh }) {
  const isFallback = status === 'fallback'
  const isLoading = status === 'loading'
  const label = isLoading
    ? `กำลังเชื่อมต่อแท็บ ${SHEET_TAB_NAME}`
    : isFallback
      ? 'โหมดสาธิต — ใช้ข้อมูลสำรอง'
      : `เชื่อมต่อแท็บ ${SHEET_TAB_NAME} แล้ว`

  return (
    <div className={`connection-status connection-status--${status}`}>
      <span className="connection-status__dot" aria-hidden="true" />
      <span className="connection-status__label">{label}</span>
      {!isLoading && lastSync && <span className="connection-status__time">อัปเดต {formatSyncTime(lastSync)} น.</span>}
      <button type="button" className="icon-button" onClick={onRefresh} aria-label="รีเฟรชข้อมูลจาก Google Sheet" title="รีเฟรชข้อมูล">
        <RefreshIcon size={17} />
      </button>
    </div>
  )
}

export default function App() {
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [resultState, setResultState] = useState('idle')
  const [connection, setConnection] = useState('loading')
  const [lastSync, setLastSync] = useState(null)
  const inputRef = useRef(null)

  const loadData = useCallback(async () => {
    setConnection('loading')
    try {
      const response = await fetchSheetRows()
      setRows(response.rows)
      setConnection('connected')
      setLastSync(new Date())
      return response.rows
    } catch {
      setRows(FALLBACK_ROWS)
      setConnection('fallback')
      setLastSync(new Date())
      return FALLBACK_ROWS
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = async (event) => {
    event?.preventDefault()
    if (!query.trim()) {
      setMatches([])
      setResultState('idle')
      inputRef.current?.focus()
      return
    }

    setResultState('loading')
    const sourceRows = rows.length > 0 ? rows : await loadData()

    window.setTimeout(() => {
      const foundRows = searchSheetRows(sourceRows, query).slice(0, 12)
      setMatches(foundRows)
      setResultState(foundRows.length > 0 ? 'success' : 'not-found')
    }, 220)
  }

  const clearSearch = () => {
    setQuery('')
    setMatches([])
    setResultState('idle')
    inputRef.current?.focus()
  }

  return (
    <div className="page-shell">
      <div className="app-frame">
        <header className="topbar">
          <a className="brand" href="/" aria-label="NPI Booking Desk หน้าหลัก">
            <span className="brand__mark">NPI</span>
            <span className="brand__divider" aria-hidden="true" />
            <span className="brand__name">Booking Desk</span>
          </a>
          <ConnectionStatus status={connection} lastSync={lastSync} onRefresh={loadData} />
        </header>

        <main className="content">
          <section className="search-section" aria-labelledby="search-title">
            <div className="section-heading">
              <h1 id="search-title">ตรวจสอบเลขจอง</h1>
              <p>ค้นหาเลขจองจาก Google Sheet แท็บ {SHEET_TAB_NAME} เพื่อดูสถานะสินค้า การโทร วันที่โทร และ Comment ลูกค้า</p>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <label className="sr-only" htmlFor="booking-search">เลขออเดอร์หรือเลขจอง</label>
                <SearchIcon size={24} />
                <input
                  ref={inputRef}
                  id="booking-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="กรอกเลขออเดอร์หรือเลขจอง"
                  inputMode="text"
                  autoComplete="off"
                />
                {query && (
                  <button type="button" className="clear-button" onClick={clearSearch} aria-label="ล้างเลขจอง">
                    <XIcon />
                  </button>
                )}
              </div>
              <button className="primary-button" type="submit" disabled={resultState === 'loading'}>
                {resultState === 'loading' ? <span className="button-spinner" aria-hidden="true" /> : <SearchIcon size={21} />}
                ค้นหาเลขจอง
              </button>
            </form>
            <p className="search-hint"><span className="search-hint__dot" aria-hidden="true" />ค้นหาได้ทั้งเลขเต็มและบางส่วน · กด Enter เพื่อค้นหา</p>

            <div className="result-area">
              {resultState === 'success' ? <ResultPanel rows={matches} /> : <EmptyState type={resultState} onRetry={handleSearch} />}
            </div>
          </section>

          <section className="form-section" aria-labelledby="form-title">
            <div className="form-section__copy">
              <span className="form-section__icon"><FormIcon size={25} /></span>
              <div>
                <h2 id="form-title">มีเลขจองใหม่ใช่ไหม?</h2>
                <p>เปิด Google Form เพื่อบันทึกข้อมูลเข้าสู่ระบบ</p>
              </div>
            </div>
            <a className="form-link" href={FORM_LINK} target="_blank" rel="noreferrer">
              <span>เปิด Google Form</span>
              <ExternalIcon size={18} />
            </a>
          </section>

          <footer className="app-footer">
            <span>ข้อมูลแสดงจาก Google Sheet แท็บ {SHEET_TAB_NAME}</span>
            <button type="button" className="footer-refresh" onClick={loadData}>
              <RefreshIcon size={14} />
              รีเฟรชข้อมูล
            </button>
          </footer>
        </main>
      </div>
    </div>
  )
}
