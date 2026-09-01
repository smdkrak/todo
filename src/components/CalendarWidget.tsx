import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarWidget({ tasks }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const todayObj = new Date()
  const isCurrentMonth = year === todayObj.getFullYear() && month === todayObj.getMonth()

  const renderCells = () => {
    const cells = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrentMonth && d === todayObj.getDate()
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayTasks = tasks.filter((t) => t.deadline === dateStr)
      const hasTodo = dayTasks.some((t) => t.status !== 'done')
      const hasDone = dayTasks.some((t) => t.status === 'done')
      const isSun = (firstDay + d - 1) % 7 === 0
      const isSat = (firstDay + d - 1) % 7 === 6

      cells.push(
        <div
          key={`d-${d}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3px 1px',
            borderRadius: '6px',
            background: isToday ? '#4338ca' : 'transparent',
            cursor: 'default',
            transition: 'background 0.15s',
            minHeight: '28px',
          }}
          onMouseEnter={(e) => {
            if (!isToday) e.currentTarget.style.background = 'rgba(17,24,39,0.05)'
          }}
          onMouseLeave={(e) => {
            if (!isToday) e.currentTarget.style.background = 'transparent'
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: isToday ? 700 : 500,
              lineHeight: 1,
              color: isToday ? '#fff' : isSun ? '#ef4444' : isSat ? '#6d28d9' : '#374151',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {d}
          </span>
          {dayTasks.length > 0 && (
            <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
              {hasTodo && (
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: isToday ? 'rgba(255,255,255,0.7)' : '#4338ca',
                  }}
                />
              )}
              {hasDone && (
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: isToday ? 'rgba(255,255,255,0.5)' : '#047857',
                  }}
                />
              )}
            </div>
          )}
        </div>,
      )
    }

    return cells
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        padding: '12px 14px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#1a1c3a',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {year}년 {month + 1}월
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[prevMonth, nextMonth].map((fn, i) => (
            <button
              key={i}
              onClick={fn}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '3px 4px',
                color: '#9ca3af',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(17,24,39,0.06)'
                e.currentTarget.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#9ca3af'
              }}
            >
              {i === 0 ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Day labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          marginBottom: '4px',
          flexShrink: 0,
        }}
      >
        {DAYS.map((day, i) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 600,
              color: i === 0 ? '#ef4444' : i === 6 ? '#6d28d9' : '#9ca3af',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          flex: 1,
          alignContent: 'start',
        }}
      >
        {renderCells()}
      </div>
    </div>
  )
}
