import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  INITIAL_STOCK_ROWS,
  formatStockDate,
  mergeImportedRows,
  mergeWorkflow,
  parseStockImport,
  readWorkflowState,
  readStockRows,
  writeStockRows,
  writeWorkflowState,
} from './lib/stock'
import { SHEET_TAB_NAME, fetchSheetRows } from './lib/sheet'

const timeFormatter = new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' })
const FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSefKgnfXIoJOJ-aed-eUXkOKe1Rd-B5Y0SG4mxF2Lk7GGEvpA/viewform'

function mapSheetRowToAppRow(row) {
  const callStatus = String(row.callStatus ?? '').trim()
  const callDate = String(row.callDate ?? '').trim()
  const comment = String(row.comment ?? '').trim()
  const employee = String(row.owner || row.employee || '').trim()
  const productStatus = String(row.productStatus ?? '').trim()
  const called = Boolean(callStatus)

  return {
    order: row.order,
    product: productStatus || 'ยังไม่มีข้อมูลสถานะสินค้า',
    productStatus,
    quantity: 0,
    stock: 0,
    customer: employee || 'ยังไม่มีข้อมูลผู้รับผิดชอบ',
    phone: '-',
    shelf: '-',
    channel: `Google Sheet · ${SHEET_TAB_NAME}`,
    called,
    reserved: false,
    employee,
    billStatus: row.billStatus || '',
    callStatus,
    callDate,
    comment,
    note: comment,
    updatedAt: callDate || formatStockDate(),
    history: called ? [{
      type: 'called',
      label: 'โทรแล้ว',
      at: callDate || 'มีข้อมูลการโทร',
      by: employee || 'เจ้าหน้าที่',
      detail: 'อ่านจากคอลัมน์ โทรตามลูกค้า ใน Google Sheet',
    }] : [],
    source: 'sheet',
  }
}

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="3" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    box: <><path d="m4 7 8 4 8-4M12 11v9M5 6l7-3 7 3v12l-7 4-7-4V6Z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5M16 6.5a2.5 2.5 0 0 1 0 5M17 15c2.1.1 3.4 1.8 3.8 4" /></>,
    chart: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-6" /></>,
    settings: <><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /><circle cx="12" cy="12" r="4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4.2 4.2" /></>,
    calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M7 3v3M17 3v3M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth="2.2" /></>,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    phone: <><path d="M6.5 3.5 4 5c-.5.4-.7 1.1-.5 1.7 1.8 6.3 7 11.5 13.3 13.3.6.2 1.3 0 1.7-.5l1.5-2.5-4.3-2.1-1.5 1.7a14.4 14.4 0 0 1-5.8-5.8l1.7-1.5-2.1-4.3Z" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    check: <><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" /><path d="m7.8 12.1 2.7 2.7 5.8-6" stroke="white" strokeWidth="2" /></>,
    package: <><path d="m4 7 8 4 8-4M12 11v9M5 6l7-3 7 3v12l-7 4-7-4V6Z" /><path d="m8 4 8 4" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    upload: <><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 14v5h14v-5" /></>,
    refresh: <><path d="M20 11a8.1 8.1 0 0 0-14.9-3.8L3.2 9.1M3 5.1v4h4M4 13a8.1 8.1 0 0 0 14.9 3.8l1.9-1.9M21 18.9v-4h-4" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    note: <><path d="M5 3.5h10l4 4v13H5v-17Z" /><path d="M15 3.5v4h4M8 12h8M8 16h5" /></>,
    arrowUp: <><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" /></>,
  }

  return <svg {...common}>{paths[name] ?? paths.grid}</svg>
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function Sidebar({ activeView, onChangeView }) {
  const primaryItems = [
    { id: 'home', label: 'หน้าหลัก', icon: 'grid' },
    { id: 'follow-up', label: 'งานติดตามลูกค้า', icon: 'list' },
    { id: 'orders', label: 'รายการสั่งซื้อ', icon: 'bag' },
    { id: 'inventory', label: 'สินค้า / สต็อก', icon: 'box' },
    { id: 'customers', label: 'ลูกค้า', icon: 'users' },
    { id: 'reports', label: 'รายงาน', icon: 'chart' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <BrandMark />
        <span>NPI Follow-up</span>
      </div>

      <nav className="sidebar__nav" aria-label="เมนูหลัก">
        {primaryItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'nav-item--active' : ''}`}
            onClick={() => onChangeView(item.id)}
            disabled={item.id !== 'follow-up'}
            title={item.id === 'follow-up' ? undefined : 'กำลังพัฒนา'}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button type="button" className="nav-item" disabled title="กำลังพัฒนา">
          <Icon name="settings" size={19} />
          <span>ตั้งค่า</span>
        </button>
        <div className="sidebar__user">
          <span className="avatar avatar--light">กส</span>
          <span className="sidebar__user-copy">
            <strong>กมล สายดี</strong>
            <small>พนักงานหน้าร้าน</small>
          </span>
        </div>
        <button type="button" className="logout-button" onClick={() => window.alert('ออกจากระบบเป็นฟังก์ชันสำหรับการเชื่อมต่อจริง')}>
          <Icon name="arrowUp" size={17} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}

function StatusToggle({ kind, active, onClick }) {
  const isCall = kind === 'called'
  const label = isCall ? (active ? 'โทรแล้ว' : 'รอติดต่อ') : (active ? 'เก็บของแล้ว' : 'รอเก็บ')
  return (
    <button
      type="button"
      className={`status-toggle ${active ? 'status-toggle--active' : 'status-toggle--pending'} ${isCall ? 'status-toggle--call' : 'status-toggle--reserve'}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      aria-pressed={active}
      title={active ? `ยกเลิกสถานะ${label}` : `บันทึก${label}`}
    >
      <Icon name={active ? 'check' : isCall ? 'clock' : 'package'} size={15} />
      <span>{label}</span>
    </button>
  )
}

function StatusPill({ value, emptyLabel = 'ยังไม่มีข้อมูล', tone = 'neutral' }) {
  const hasValue = Boolean(String(value ?? '').trim())
  return (
    <span className={`data-pill data-pill--${hasValue ? tone : 'empty'}`}>
      {hasValue && tone === 'success' && <Icon name="check" size={13} />}
      {hasValue ? value : emptyLabel}
    </span>
  )
}

function StatCard({ label, value, icon, tone, detail }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <span className="stat-card__icon"><Icon name={icon} size={22} /></span>
    </div>
  )
}

function TableRow({ row, selected, onSelect }) {
  return (
    <tr
      className={selected ? 'table-row--selected' : ''}
      onClick={() => onSelect(row.order)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(row.order)
      }}
      tabIndex="0"
    >
      <td className="cell-order"><strong>{row.order}</strong></td>
      <td className="cell-product">
        <strong>{row.employee || row.customer || 'ยังไม่มีข้อมูล'}</strong>
        <span>{row.channel}</span>
      </td>
      <td className="cell-status"><StatusPill value={row.productStatus} emptyLabel="ยังไม่มีข้อมูล" tone="success" /></td>
      <td className="cell-call"><StatusPill value={row.callStatus ? 'โทรแล้ว' : ''} emptyLabel="ยังไม่ได้โทร" tone="success" /></td>
      <td className="cell-updated">{row.callDate || '-'}</td>
      <td className="cell-comment" title={row.comment || undefined}>{row.comment || '-'}</td>
      <td className="cell-status"><StatusPill value={row.billStatus} emptyLabel="ยังไม่มีข้อมูล" /></td>
      <td className="cell-more">
        <button type="button" aria-label={`เปิดรายละเอียด ${row.order}`} onClick={(event) => { event.stopPropagation(); onSelect(row.order) }}>
          <Icon name="more" size={19} />
        </button>
      </td>
    </tr>
  )
}

function DetailDrawer({ row, onClose }) {
  return (
    <aside className="detail-drawer" aria-label={`รายละเอียด ${row.order}`}>
      <div className="detail-drawer__header">
        <div>
          <span className="drawer-kicker">รายละเอียด Order No</span>
          <h2>{row.order}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="ปิดรายละเอียด">
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="drawer-scroll">
        <div className="drawer-product">
          <span className="product-symbol"><Icon name="package" size={25} /></span>
          <div>
            <strong>{row.productStatus || 'สถานะสินค้า'}</strong>
            <span>{row.channel}</span>
          </div>
        </div>

        <dl className="drawer-facts">
          <div><dt>พนักงาน</dt><dd>{row.employee || 'ยังไม่มีข้อมูล'}</dd></div>
          <div><dt>สถานะบิลมัดจำ</dt><dd><StatusPill value={row.billStatus} /></dd></div>
          <div><dt>สถานะสินค้า</dt><dd><StatusPill value={row.productStatus} tone="success" /></dd></div>
          <div><dt>โทรตามลูกค้า</dt><dd><StatusPill value={row.callStatus ? 'โทรแล้ว' : ''} emptyLabel="ยังไม่ได้โทร" tone="success" /></dd></div>
          <div><dt>วันที่โทร</dt><dd>{row.callDate || 'ยังไม่มีข้อมูล'}</dd></div>
          <div><dt>Comment ลูกค้า</dt><dd className="drawer-facts__comment">{row.comment || 'ยังไม่มีข้อมูล'}</dd></div>
        </dl>

        <section className="history-section">
          <div className="drawer-section-heading">
            <h3>ประวัติการติดตาม</h3>
            <span>{row.history.length} รายการ</span>
          </div>
          <div className="timeline">
            {row.history.map((item, index) => (
              <div className="timeline-item" key={`${item.at}-${item.label}-${index}`}>
                <span className={`timeline-dot timeline-dot--${item.type}`} />
                <div>
                  <div className="timeline-item__heading">
                    <strong>{item.label}</strong>
                    <span>{item.at}</span>
                  </div>
                  <small>โดย {item.by}</small>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  )
}

function ImportModal({ value, onChange, onClose, onImport }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="import-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <div className="import-modal__header">
          <div>
            <span className="drawer-kicker">Fallback สำหรับต้นทางที่ยังไม่มี API</span>
            <h2 id="import-title">นำเข้ารายการ Stock</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="ปิดหน้าต่างนำเข้า">
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="import-modal__copy">วางข้อมูลแบบ TSV/CSV โดยมีหัวตารางอย่างน้อย <strong>Order No, สินค้า, จำนวน, Stock</strong> สถานะการโทรและการเก็บของจะคงอยู่ตาม Order No เดิม</p>
        <textarea
          className="import-textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={'Order No\tสินค้า\tจำนวน\tStock\nOD241024-015\tเคส iPhone 15\t1\t6'}
          autoFocus
        />
        <div className="import-modal__footer">
          <button type="button" className="secondary-button" onClick={onClose}>ยกเลิก</button>
          <button type="button" className="primary-button primary-button--compact" onClick={onImport}>
            <Icon name="upload" size={17} />
            นำเข้าข้อมูล
          </button>
        </div>
      </section>
    </div>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  return <div className={`toast toast--${toast.type}`} role="status"><Icon name={toast.type === 'error' ? 'close' : 'check'} size={16} />{toast.message}</div>
}

export default function App() {
  const [rows, setRows] = useState(() => mergeWorkflow(readStockRows() ?? INITIAL_STOCK_ROWS, readWorkflowState()))
  const [activeView, setActiveView] = useState('follow-up')
  const [search, setSearch] = useState('')
  const [filterKey, setFilterKey] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(new Date())
  const [sourceStatus, setSourceStatus] = useState('loading')
  const [toast, setToast] = useState(null)

  const loadSheetSource = useCallback(async () => {
    setIsSyncing(true)
    setSourceStatus('loading')

    try {
      const response = await fetchSheetRows()
      const nextRows = response.rows.map(mapSheetRowToAppRow)
      if (!nextRows.length) throw new Error('No rows found')
      setRows(nextRows)
      setSourceStatus('connected')
      setLastSync(new Date())
    } catch {
      setRows(mergeWorkflow(readStockRows() ?? INITIAL_STOCK_ROWS, readWorkflowState()))
      setSourceStatus('fallback')
      setLastSync(new Date())
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    loadSheetSource()
  }, [loadSheetSource])

  useEffect(() => {
    writeStockRows(rows)
    writeWorkflowState(rows)
  }, [rows])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const selectedRow = rows.find((row) => row.order === selectedOrder) ?? null

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((row) => !row.called).length,
    called: rows.filter((row) => row.called).length,
    commented: rows.filter((row) => row.comment).length,
  }), [rows])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch = !term || [row.order, row.employee, row.productStatus, row.callStatus, row.callDate, row.comment, row.billStatus].some((field) => String(field).toLowerCase().includes(term))
      const matchesWorkflow = filterKey === 'all'
        || (filterKey === 'pending' && !row.called)
        || (filterKey === 'called' && row.called)
        || (filterKey === 'commented' && row.comment)
      const matchesProduct = productFilter === 'all'
        || (productFilter === 'filled' && row.productStatus)
        || (productFilter === 'empty' && !row.productStatus)
      return matchesSearch && matchesWorkflow && matchesProduct
    })
  }, [filterKey, productFilter, rows, search])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const refreshSource = () => {
    loadSheetSource()
    showToast(`กำลังอัปเดตข้อมูลจากแท็บ ${SHEET_TAB_NAME}`)
  }

  const importRows = () => {
    const imported = parseStockImport(importText)
    if (!imported.length) {
      showToast('อ่านข้อมูลไม่สำเร็จ ตรวจหัวตารางหรือรูปแบบ CSV/TSV อีกครั้ง', 'error')
      return
    }
    setRows((current) => mergeImportedRows(current, imported))
    setSourceStatus('fallback')
    setLastSync(new Date())
    setImportText('')
    setIsImportOpen(false)
    showToast(`นำเข้า ${imported.length} รายการแล้ว`)
  }

  const tabs = [
    { id: 'all', label: 'ทั้งหมด', count: stats.total },
    { id: 'pending', label: 'รอติดต่อ', count: stats.pending },
    { id: 'called', label: 'โทรแล้ว', count: stats.called },
    { id: 'commented', label: 'มี Comment', count: stats.commented },
  ]

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onChangeView={setActiveView} />

      <div className="app-content">
        <header className="topbar">
          <div className="global-search">
            <Icon name="search" size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขออเดอร์, พนักงาน หรือ Comment" aria-label="ค้นหาเลขออเดอร์ พนักงาน หรือ Comment" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar__actions">
            <span className="notification-button" aria-label="การแจ้งเตือน"><Icon name="bell" size={20} /><span /></span>
            <span className="topbar__divider" />
            <div className="profile-button">
              <span className="avatar">กส</span>
              <span><strong>สาขา เซ็นทรัลลาดพร้าว</strong><small>พนักงานหน้าร้าน</small></span>
              <Icon name="chevronDown" size={16} />
            </div>
          </div>
        </header>

        <main className="workspace">
          <section className="page-heading">
            <div>
              <div className="page-heading__title-row">
                <h1>งานติดตามลูกค้า</h1>
                <span className={`source-status source-status--${sourceStatus}`}><span className={isSyncing ? 'source-status__dot source-status__dot--syncing' : 'source-status__dot'} />{isSyncing ? `กำลังอัปเดต ${SHEET_TAB_NAME}` : sourceStatus === 'connected' ? `เชื่อมต่อ ${SHEET_TAB_NAME} แล้ว` : 'โหมดออฟไลน์'}</span>
              </div>
              <p>ตรวจสอบสถานะสินค้า การโทร วันที่โทร และ Comment ของลูกค้าจากแท็บ {SHEET_TAB_NAME} ในที่เดียว</p>
            </div>
            <div className="page-heading__actions">
              <div className="date-button" aria-label="วันที่แสดงผล"><Icon name="calendar" size={17} /> วันนี้ <span>{formatStockDate().split(' ').slice(0, 3).join(' ')}</span></div>
              <a className="secondary-button" href={FORM_LINK} target="_blank" rel="noreferrer"><Icon name="upload" size={17} /> เปิด Google Form</a>
              <button type="button" className="primary-button primary-button--compact" onClick={refreshSource} disabled={isSyncing}><Icon name="refresh" size={17} /> อัปเดต {SHEET_TAB_NAME}</button>
            </div>
          </section>

          <section className="stats-grid" aria-label="สรุปสถานะงาน">
            <StatCard label="ทั้งหมด" value={stats.total} detail="รายการใน USE" icon="note" tone="blue" />
            <StatCard label="รอติดต่อ" value={stats.pending} detail="ยังไม่มีข้อมูลการโทร" icon="clock" tone="amber" />
            <StatCard label="โทรแล้ว" value={stats.called} detail="มีข้อมูลใน โทรตามลูกค้า" icon="phone" tone="green" />
            <StatCard label="มี Comment" value={stats.commented} detail="ข้อมูลจากลูกค้า" icon="note" tone="green" />
          </section>

          <section className="table-card" aria-labelledby="table-title">
            <div className="table-card__header">
              <div>
                <h2 id="table-title">รายการที่ต้องติดตาม</h2>
                <p>อัปเดตล่าสุด {timeFormatter.format(lastSync)} น. · ข้อมูลต้นทางจากแท็บ {SHEET_TAB_NAME}</p>
              </div>
              <div className="filter-button" aria-label={`จำนวนรายการตามตัวกรอง ${filteredRows.length}`}><Icon name="filter" size={17} /> ตัวกรอง <span>{filteredRows.length}</span></div>
            </div>

            <div className="table-toolbar">
              <div className="view-tabs" role="tablist" aria-label="กรองตามสถานะการติดตาม">
                {tabs.map((tab) => (
                  <button type="button" key={tab.id} className={filterKey === tab.id ? 'view-tab view-tab--active' : 'view-tab'} onClick={() => setFilterKey(tab.id)} role="tab" aria-selected={filterKey === tab.id}>
                    {tab.label}<span>{tab.count}</span>
                  </button>
                ))}
              </div>
              <label className="select-wrap">
                <span className="sr-only">กรองสถานะสินค้า</span>
                <select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}>
                  <option value="all">สถานะสินค้าทั้งหมด</option>
                  <option value="filled">มีสถานะสินค้า</option>
                  <option value="empty">ยังไม่มีสถานะสินค้า</option>
                </select>
                <Icon name="chevronDown" size={15} />
              </label>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>พนักงาน</th>
                    <th>สถานะสินค้า</th>
                    <th>โทรตามลูกค้า</th>
                    <th>วันที่โทร</th>
                    <th>Comment ลูกค้า</th>
                    <th>สถานะบิลมัดจำ</th>
                    <th><span className="sr-only">จัดการ</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => <TableRow key={row.order} row={row} selected={row.order === selectedOrder} onSelect={setSelectedOrder} />)}
                </tbody>
              </table>
              {!filteredRows.length && <div className="empty-table"><span><Icon name="search" size={22} /></span><strong>ไม่พบรายการที่ตรงกัน</strong><p>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p></div>}
            </div>

            <div className="table-footer">
              <span>แสดง {filteredRows.length} จาก {rows.length} รายการ</span>
              <div className="pagination"><button type="button" disabled><Icon name="chevronRight" size={16} /></button><button type="button" className="pagination__active">1</button><button type="button" disabled>2</button><button type="button" disabled><Icon name="chevronRight" size={16} /></button></div>
            </div>
          </section>

          <footer className="workspace-footer">
            <span><span className="footer-dot" />ข้อมูลแสดงจาก Google Sheet แท็บ {SHEET_TAB_NAME} · E = โทรตามลูกค้า, F = Date Call, G = Comment</span>
            <button type="button" onClick={refreshSource}><Icon name="refresh" size={14} /> รีเฟรชข้อมูล</button>
          </footer>
        </main>
      </div>

      {selectedRow && <DetailDrawer row={selectedRow} onClose={() => setSelectedOrder(null)} />}
      {isImportOpen && <ImportModal value={importText} onChange={setImportText} onClose={() => setIsImportOpen(false)} onImport={importRows} />}
      <Toast toast={toast} />
    </div>
  )
}
