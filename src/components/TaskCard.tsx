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
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,250,255,0.96))',
        borderRadius: '14px',
        border: '1px solid rgba(48,55,104,0.10)',
        padding: '10px 12px 10px',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
        minHeight: '84px',
        opacity: isDragging ? 0.45 : 1,
        boxShadow: isDragging
          ? 'none'
          : '0 10px 24px rgba(35,41,82,0.08), 0 2px 6px rgba(35,41,82,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        transition: 'box-shadow 0.2s ease, transform 0.18s ease, opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        if (isDragging) return
        e.currentTarget.style.boxShadow = `0 14px 30px ${accentColor}20, 0 0 0 1.5px ${accentColor}30`
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 24px rgba(35,41,82,0.08), 0 2px 6px rgba(35,41,82,0.04), inset 0 1px 0 rgba(255,255,255,0.9)'
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
          width: '4px',
          background: `linear-gradient(180deg, ${accentColor}, ${accentColor}80)`,
          opacity: 0.9,
        }}
      />

      {/* Classification chip */}
      {task.classification && (
        <div style={{ marginBottom: '5px' }}>
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
          fontSize: '14px',
          fontWeight: 700,
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
        <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isOverdue && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>⚠</span>
          )}
          <span
            style={{
              fontSize: '12px',
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
