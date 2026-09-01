import { useState, useEffect } from 'react'
import { X, Trash2, Calendar, FileText, Image as ImageIcon } from 'lucide-react'
import type { Task, TaskStatus, Category } from '../types'

interface Props {
  task: Task | null
  defaultStatus: TaskStatus
  defaultCategory: string
  categories: Category[]
  onSave: (task: Omit<Task, 'id'>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function TaskModal({
  task,
  defaultStatus,
  defaultCategory,
  categories,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState(task?.title || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || defaultStatus)
  const [category, setCategory] = useState<string>(task?.category || defaultCategory)
  const [classification, setClassification] = useState<string>(task?.classification || '')
  const [deadline, setDeadline] = useState(task?.deadline || '')
  const [content, setContent] = useState(task?.content || '')
  const [imageUrl, setImageUrl] = useState(task?.imageUrl || '')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({
      title: title.trim(),
      status,
      category,
      classification: classification.trim(),
      deadline,
      content: content.trim(),
      imageUrl: imageUrl.trim(),
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,18,40,0.45)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #dde1ef',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1a1d2e' }}>
            {task ? '항목 수정' : '새 항목 추가'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요..."
            style={{
              width: '100%',
              fontSize: '22px',
              fontWeight: 600,
              color: '#1a1d2e',
              border: 'none',
              borderBottom: '2px solid transparent',
              padding: '8px 0',
              marginBottom: '24px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(17,24,39,0.08)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          />

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Status & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                  상태
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(17,24,39,0.12)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="todo">TODO</option>
                  <option value="doing">DOING</option>
                  <option value="done">DONE</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(17,24,39,0.12)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Classification & Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                  분류 (태그)
                </label>
                <input
                  type="text"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  placeholder="예: 긴급, 중요, 리뷰..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(17,24,39,0.12)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                  <Calendar size={14} /> 기한
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(17,24,39,0.12)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                <FileText size={14} /> 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상세 내용을 입력하세요..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(17,24,39,0.12)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Image URL */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                <ImageIcon size={14} /> 이미지 첨부 (URL)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(17,24,39,0.12)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              {imageUrl && (
                <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dde1ef' }}>
                  <img src={imageUrl} alt="Preview" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderTop: '1px solid #dde1ef',
            background: '#f7f8fc',
          }}
        >
          {task ? (
            <button
              onClick={() => onDelete(task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} />
              삭제
            </button>
          ) : (
            <div />
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#fff',
                color: '#4b5563',
                border: '1px solid rgba(17,24,39,0.12)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: '#4338ca',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
