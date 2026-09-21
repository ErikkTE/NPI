import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FALLBACK_ROWS,
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

function FormIcon({ size = 28 }) {
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
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DatabaseIcon({ size = 24 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="5.4" rx="7.5" ry="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 5.4v6.3c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V5.4M4.5 11.7V18c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6.3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function StatusBadge({ value, kind = 'neutral' }) {
  if (!value) return <span className="empty-cell">—</span>

  const isSuccess = kind === 'success'
  return (
    <span className={`status-badge ${isSuccess ? 'status-badge--success' : 'status-badge--neutral'}`}>
      {isSuccess && <CheckIcon size={16} />}
      {value}
    </span>
  )
}

function ResultTable({ rows }) {
  return (
    <div className="result-table" role="table" aria-label="ผลการค้นหาเลขจองจากแท็บ USE">
      <div className="result-table__head" role="row">
        <span role="columnheader">เลขออเดอร์</span>
        <span role="columnheader">สถานะบิลมัดจำ</span>
        <span role="columnheader">เป็นของใคร</span>
        <span role="columnheader">สถานะสินค้า</span>
      </div>
      {rows.map((row, index) => (
        <div className="result-table__row" role="row" key={`${row.order}-${index}`}>
          <strong data-label="เลขออเดอร์" role="cell">{row.order}</strong>
          <span data-label="สถานะบิลมัดจำ" role="cell">
            <StatusBadge value={row.billStatus} />
          </span>
          <span data-label="เป็นของใคร" role="cell">{row.owner || row.employee || '—'}</span>
          <span data-label="สถานะสินค้า" role="cell">
            <StatusBadge value={row.productStatus} kind="success" />
          </span>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ type, onRetry }) {
  if (type === 'loading') {
    return (
      <div className="empty-state empty-state--loading" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <div>
          <strong>กำลังค้นหาข้อมูล...</strong>
          <p>โปรดรอสักครู่ เรากำลังตรวจสอบข้อมูลใน Google Sheet</p>
        </div>
      </div>
    )
  }

  if (type === 'not-found') {
    return (
      <div className="empty-state empty-state--error" aria-live="polite">
        <span className="empty-state__icon"><AlertIcon size={24} /></span>
        <div>
          <strong>ไม่พบเลขออเดอร์</strong>
          <p>ไม่พบเลขออเดอร์นี้ในระบบ กรุณาตรวจสอบความถูกต้องหรือลองค้นหาอีกครั้ง</p>
          <button type="button" className="retry-button" onClick={onRetry}>
            <RefreshIcon size={17} />
            ลองค้นหาอีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="empty-state empty-state--idle" aria-live="polite">
      <span className="empty-state__icon"><DatabaseIcon size={27} /></span>
      <div>
        <strong>พร้อมค้นหาเลขออเดอร์</strong>
        <p>กรอกเลขออเดอร์ด้านบนเพื่อดูสถานะล่าสุดจาก Google Sheet</p>
      </div>
    </div>
  )
}

function ConnectionStatus({ status, lastSync, onRefresh }) {
  const isFallback = status === 'fallback'
  const isLoading = status === 'loading'
  const label = isLoading
    ? 'กำลังเชื่อมต่อแท็บ USE'
    : isFallback
      ? 'โหมดสาธิต — ใช้ข้อมูลสำรอง'
      : 'เชื่อมต่อแท็บ USE แล้ว'

  return (
    <div className={`connection-status connection-status--${status}`}>
      <span className="connection-status__dot" aria-hidden="true" />
      <span>{label}</span>
      {!isLoading && lastSync && <span className="connection-status__time">อัปเดต {formatSyncTime(lastSync)} น.</span>}
      <button type="button" className="icon-button" onClick={onRefresh} aria-label="รีเฟรชข้อมูลจาก Google Sheet" title="รีเฟรชข้อมูล">
        <RefreshIcon size={16} />
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
    }, 240)
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
              <span className="section-heading__rail" aria-hidden="true" />
              <div>
                <h1 id="search-title">ตรวจสอบเลขจอง</h1>
                <p>ค้นหาเลขจองจากแท็บ USE ใน Google Sheet เพื่อดูสถานะล่าสุดและว่าเป็นของใคร</p>
              </div>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <label className="sr-only" htmlFor="booking-search">เลขออเดอร์หรือเลขจอง</label>
                <SearchIcon size={23} />
                <input
                  ref={inputRef}
                  id="booking-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="กรอกเลขออเดอร์ เช่น DEMO-001"
                  inputMode="text"
                  autoComplete="off"
                />
                {query && (
                  <button type="button" className="clear-button" onClick={clearSearch} aria-label="ล้างเลขออเดอร์">
                    <XIcon />
                  </button>
                )}
              </div>
              <button className="primary-button" type="submit" disabled={resultState === 'loading'}>
                {resultState === 'loading' ? <span className="button-spinner" aria-hidden="true" /> : null}
                ค้นหาเลขจอง
              </button>
            </form>
            <p className="search-hint">ระบบค้นหาจากแท็บ USE โดยตรง รองรับทั้งเลขจองเต็มและบางส่วน</p>

            <div className="result-area">
              {resultState === 'success' ? (
                <div className="success-result" aria-live="polite">
                  <div className="success-result__heading">
                    <span className="success-result__icon"><CheckIcon size={25} /></span>
                    <strong>พบข้อมูลเลขออเดอร์นี้</strong>
                    <span className="success-result__count">{matches.length} รายการ</span>
                  </div>
                  <ResultTable rows={matches} />
                </div>
              ) : (
                <EmptyState type={resultState} onRetry={handleSearch} />
              )}
            </div>
          </section>

          <section className="form-section" aria-labelledby="form-title">
            <div className="form-section__copy">
              <span className="section-heading__rail" aria-hidden="true" />
              <div>
                <h2 id="form-title">บันทึกเลขจองใหม่</h2>
                <p>กรอกข้อมูลผ่าน Google Form เพื่อบันทึกเลขจองใหม่ในระบบ</p>
              </div>
            </div>
            <a className="form-link" href={FORM_LINK} target="_blank" rel="noreferrer">
              <span className="form-link__icon"><FormIcon /></span>
              <span className="form-link__text">
                <strong>เปิด Google Form</strong>
                <small>ระบบจะเปิด Google Form ในหน้าต่างใหม่</small>
              </span>
              <ExternalIcon />
            </a>
          </section>

          <footer className="app-footer">
            <span>ข้อมูลแสดงจากแท็บ USE ใน Google Sheet ที่เชื่อมต่ออยู่</span>
            <a href={FORM_LINK} target="_blank" rel="noreferrer">เปิดแบบฟอร์มบันทึกเลขจอง <ExternalIcon size={14} /></a>
          </footer>
        </main>
      </div>
    </div>
  )
}
