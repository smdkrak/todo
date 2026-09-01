import { useState } from 'react'
import { Plus, Maximize2, X } from 'lucide-react'
import type { Notice } from '../types'

interface Props {
  notices: Notice[]
  onAddNotice: (text: string, date?: string) => void
  onDeleteNotice: (id: string) => void
  onUpdateNotice: (id: string, text: string, date?: string) => void
  onShowList: () => void
}

const formatDate = (dateStr: string) => {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}

const S = {
  panel: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#fff',
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(17,24,39,0.07)',
    background: '#fff',
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#6b7280',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '4px',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
    background: 'transparent',
    color: '#9ca3af',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    borderRadius: '9px',
    fontSize: '11px',
    fontWeight: 700,
    background: 'rgba(67,56,202,0.1)',
    color: '#4338ca',
    marginLeft: '6px',
  },
}

export function NoticePanel({ notices, onAddNotice, onDeleteNotice, onUpdateNotice, onShowList }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [newDate, setNewDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState('')

  const handleAdd = () => {
    if (newText.trim()) {
      onAddNotice(newText.trim(), newDate || undefined)
      setNewText('')
      setNewDate('')
      setIsAdding(false)
    }
  }

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      onUpdateNotice(id, editText.trim(), editDate || undefined)
    }
    setEditingId(null)
  }

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={S.headerTitle}>공지사항</span>
          <span style={S.countBadge}>{notices.length}</span>
        </div>
        <div style={S.headerActions}>
          <button
            style={S.iconBtn}
            onClick={() => setIsAdding((v) => !v)}
            title="추가"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(67,56,202,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Plus size={14} />
          </button>
          <button
            style={S.iconBtn}
            onClick={onShowList}
            title="전체보기"
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Add form */}
      {isAdding && (
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid rgba(17,24,39,0.06)',
            background: 'rgba(67,56,202,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{
                padding: '5px 8px',
                border: '1px solid rgba(17,24,39,0.12)',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                background: '#fff',
                color: '#374151',
                flex: '0 0 auto',
              }}
            />
            <input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setIsAdding(false)
              }}
              placeholder="공지사항 내용"
              style={{
                flex: 1,
                padding: '5px 8px',
                border: '1px solid rgba(17,24,39,0.12)',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                background: '#fff',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                padding: '0 12px',
                background: '#4338ca',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="scroll-thin" style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {notices.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '28px', color: '#d1d5db', fontSize: '13px' }}>
            공지사항이 없습니다
          </div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {notices.map((notice) => (
            <li
              key={notice.id}
              className="group"
              style={{
                position: 'relative',
                borderRadius: '6px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(17,24,39,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {editingId === notice.id ? (
                <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    style={{ fontSize: '13px', padding: '4px 6px', borderRadius: '5px', border: '1px solid rgba(17,24,39,0.12)', outline: 'none', background: '#fff' }}
                    />
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(notice.id); if (e.key === 'Escape') setEditingId(null) }}
                    style={{ flex: 1, fontSize: '13px', padding: '4px 6px', borderRadius: '5px', border: '1px solid rgba(17,24,39,0.12)', outline: 'none', background: '#fff' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditingId(null)} style={{ fontSize: '12px', padding: '3px 8px', cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#fff' }}>취소</button>
                  <button onClick={() => handleSaveEdit(notice.id)} style={{ fontSize: '12px', padding: '3px 8px', cursor: 'pointer', border: 'none', borderRadius: '4px', background: '#5b5ce2', color: '#fff', fontWeight: 600 }}>저장</button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    padding: '5px 30px 5px 8px',
                    cursor: 'pointer',
                    minWidth: 0,
                  }}
                  onClick={() => {
                    setEditingId(notice.id)
                    setEditText(notice.text)
                    setEditDate(notice.date || '')
                  }}
                >
                  {notice.date && (
                    <span
                      style={{
                          fontSize: '12px',
                        fontWeight: 700,
                        color: '#4338ca',
                        background: 'rgba(67,56,202,0.08)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        marginRight: '7px',
                        fontFamily: "'DM Sans', monospace",
                      }}
                    >
                      {formatDate(notice.date)}
                    </span>
                  )}
                  <span
                    style={{
                          fontSize: '14px',
                      fontWeight: 700,
                      color: '#1a1c3a',
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0,
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                  >
                    {notice.text}
                  </span>
                </div>
              )}
              {/* Delete button */}
              {editingId !== notice.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteNotice(notice.id) }}
                  className="opacity-0 group-hover:opacity-100"
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '3px',
                    color: '#9ca3af',
                    display: 'flex',
                    transition: 'color 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <X size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
