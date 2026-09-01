import type { Task } from '../types'

interface Props {
  task: Task
  onClick: () => void
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
  accentColor?: string
  isDragging?: boolean
}

export function TaskCard({ task, onClick, onDragStart, accentColor = '#4338ca', isDragging = false }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = task.deadline ? new Date(task.deadline) : null
  if (deadline) deadline.setHours(0, 0, 0, 0)

  const isOverdue = deadline && deadline < today && task.status !== 'done'
  const isUrgent = deadline && !isOverdue && deadline.getTime() - today.getTime() < 2 * 86400000

  const deadlineColor = isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#94a3b8'

  return (
    <div
      className="task-card"
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid rgba(17,24,39,0.07)',
        padding: '11px 13px',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '190px',
        opacity: isDragging ? 0.45 : 1,
        boxShadow: isDragging
          ? 'none'
          : '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.18s ease, opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        if (isDragging) return
        e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}1a, 0 0 0 1.5px ${accentColor}28, 0 1px 3px rgba(0,0,0,0.04)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: accentColor,
          opacity: 0.6,
        }}
      />

      {/* Classification chip */}
      {task.classification && (
        <div style={{ marginBottom: '7px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '4px',
              background: `${accentColor}12`,
              color: accentColor,
              letterSpacing: '0.04em',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {task.classification}
          </span>
        </div>
      )}

      {/* Title */}
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#1a1c3a',
          lineHeight: 1.45,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontFamily: "'Noto Sans KR', sans-serif",
          wordBreak: 'break-all',
        }}
      >
        {task.title}
      </h3>

      {/* Deadline */}
      {deadline && (
        <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isOverdue && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>⚠</span>
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: deadlineColor,
              fontFamily: "'DM Sans', monospace",
            }}
          >
            {deadline.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            {isOverdue && ' 지연'}
          </span>
        </div>
      )}
    </div>
  )
}
