import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Notice } from '../types'

interface Props {
  notices: Notice[]
  onDelete: (id: string) => void
  onAdd: (text: string, date?: string) => void
  onClose: () => void
}

export function NoticeListModal({ notices, onDelete, onAdd, onClose }: Props) {
  const [newText, setNewText] = useState('')
  const [newDate, setNewDate] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 35, 64, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#fff',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #dde1ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>전체 공지사항</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '16px', borderBottom: '1px solid #dde1ef', display: 'flex', gap: '8px' }}>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: '8px', border: '1px solid #c5cadf', borderRadius: '6px' }} />
          <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && newText.trim() && (onAdd(newText.trim(), newDate), setNewText(''), setNewDate(''))} placeholder="새 공지사항..." style={{ flex: 1, padding: '8px', border: '1px solid #c5cadf', borderRadius: '6px' }} />
          <button onClick={() => newText.trim() && (onAdd(newText.trim(), newDate), setNewText(''), setNewDate(''))} style={{ padding: '8px 16px', background: '#5569f8', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>추가</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {notices.map(notice => (
            <div key={notice.id} style={{ padding: '12px', background: '#f8f9fc', borderRadius: '8px', marginBottom: '8px', display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                {notice.date && <div style={{ fontSize: '11px', color: '#5569f8', fontWeight: 700, marginBottom: '4px' }}>{notice.date}</div>}
                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{notice.text}</div>
              </div>
              <button onClick={() => onDelete(notice.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
