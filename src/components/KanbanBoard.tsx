import React, { useState, useRef, useEffect } from 'react'
import { Plus, ArrowUpDown, Check } from 'lucide-react'
import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

interface Props {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
  onMoveTask?: (taskId: string, newStatus: TaskStatus, beforeTaskId?: string) => void
}

type SortMode = 'default' | 'deadline' | 'classification'

const COLUMNS: {
  status: TaskStatus
  label: string
  accent: string
  accentDim: string
}[] = [
  { status: 'todo', label: 'TODO', accent: '#5b5ce2', accentDim: 'rgba(91,92,226,0.12)' },
  { status: 'doing', label: 'DOING', accent: '#a855f7', accentDim: 'rgba(168,85,247,0.11)' },
  { status: 'done', label: 'DONE', accent: '#0f9f78', accentDim: 'rgba(15,159,120,0.11)' },
]

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'default', label: '기본 순서' },
  { mode: 'deadline', label: '마감날짜순' },
  { mode: 'classification', label: '항목별 묶기' },
]

function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  if (mode === 'deadline') {
    return [...tasks].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })
  }
  if (mode === 'classification') {
    return [...tasks].sort((a, b) =>
      (a.classification || '미분류').localeCompare(b.classification || '미분류', 'ko'),
    )
  }
  return tasks
}

function groupByClassification(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>()
  tasks.forEach((t) => {
    const key = t.classification || '미분류'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  })
  return map
}

function EmptyState({ accent }: { accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
        gap: '10px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: `1.5px dashed ${accent}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={16} style={{ color: `${accent}60` }} />
      </div>
      <span style={{ fontSize: '12px', color: '#c4c8d6', fontWeight: 500 }}>항목 없음</span>
    </div>
  )
}

export function KanbanBoard({ tasks, onSelectTask, onAddTask, onMoveTask }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const [sortModes, setSortModes] = useState<Record<TaskStatus, SortMode>>({
    todo: 'default',
    doing: 'default',
    done: 'default',
  })
  const [openSortMenu, setOpenSortMenu] = useState<TaskStatus | null>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setOpenSortMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id)
    setSortModes({ todo: 'default', doing: 'default', done: 'default' })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(status)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault()
    if (draggedId && onMoveTask) {
      onMoveTask(draggedId, status)
    }
    setDraggedId(null)
    setDragOverCol(null)
  }

  const handleCardDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus, beforeTaskId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedId && draggedId !== beforeTaskId && onMoveTask) {
      onMoveTask(draggedId, status, beforeTaskId)
    }
    setDraggedId(null)
    setDragOverCol(null)
  }

  const handleDragLeave = () => {
    setDragOverCol(null)
  }

  return (
    <div
      className="kanban-container"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        overflow: 'hidden',
      }}
    >
      {COLUMNS.map((col, idx) => {
        const colTasks = tasks.filter((t) => t.status === col.status)
        const mode = sortModes[col.status]
        const sorted = sortTasks(colTasks, mode)
        const isDropTarget = dragOverCol === col.status && draggedId !== null
        const isMenuOpen = openSortMenu === col.status

        return (
          <div
            key={col.status}
            className="kanban-column"
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: isDropTarget ? `${col.accent}0d` : 'rgba(248,249,253,0.72)',
              borderRight: idx < 2 ? '1px solid rgba(31,38,75,0.08)' : 'none',
              borderBottom: '1px solid rgba(31,38,75,0.08)',
              transition: 'background 0.2s',
              minHeight: 0,
              overflow: 'visible',
            }}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            onDragLeave={handleDragLeave}
          >
            {/* Column header */}
            <div
              className="kanban-column-header"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.88)',
                borderBottom: '1px solid rgba(31,38,75,0.08)',
                borderTop: `3px solid ${col.accent}`,
                position: 'relative',
                zIndex: isMenuOpen ? 60 : 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: col.accent,
                    letterSpacing: '0.12em',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    fontFamily: "'DM Sans', monospace",
                    background: 'rgba(17,24,39,0.05)',
                    borderRadius: '10px',
                    padding: '1px 7px',
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }} ref={isMenuOpen ? sortMenuRef : null}>
                {/* Sort button */}
                <button
                  onClick={() => setOpenSortMenu(isMenuOpen ? null : col.status)}
                  title="정렬"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '9px',
                    border: mode !== 'default' ? `1.5px solid ${col.accent}40` : '1px solid rgba(17,24,39,0.1)',
                    background: mode !== 'default' ? col.accentDim : 'transparent',
                    color: mode !== 'default' ? col.accent : '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <ArrowUpDown size={13} />
                </button>

                {/* Sort dropdown */}
                {isMenuOpen && (
                  <div
                    className="animate-slide-down"
                    ref={sortMenuRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '6px',
                      background: '#fff',
                      border: '1px solid rgba(17,24,39,0.1)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
                      zIndex: 200,
                      minWidth: '132px',
                      overflow: 'hidden',
                      padding: '4px',
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const active = mode === opt.mode
                      return (
                        <button
                          key={opt.mode}
                          onClick={() => {
                            setSortModes((prev) => ({ ...prev, [col.status]: opt.mode }))
                            setOpenSortMenu(null)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '7px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            background: active ? col.accentDim : 'transparent',
                            color: active ? col.accent : '#374151',
                            fontSize: '12px',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.12s',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            if (!active) e.currentTarget.style.background = 'rgba(17,24,39,0.04)'
                          }}
                          onMouseLeave={(e) => {
                            if (!active) e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          {opt.label}
                          {active && <Check size={12} strokeWidth={2.5} />}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Add button */}
                <button
                  onClick={() => onAddTask(col.status)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '7px 11px',
                    borderRadius: '9px',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid rgba(17,24,39,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = col.accent
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.borderColor = col.accent
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#6b7280'
                    e.currentTarget.style.borderColor = 'rgba(17,24,39,0.1)'
                  }}
                >
                  <Plus size={13} />
                  추가
                </button>
              </div>
            </div>

            {/* Cards area */}
            <div
              className="scroll-thin"
              style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px', position: 'relative', zIndex: 1 }}
            >
              {colTasks.length === 0 ? (
                <EmptyState accent={col.accent} />
              ) : mode === 'classification' ? (
                // Grouped by classification
                Array.from(groupByClassification(sorted).entries()).map(([cls, groupTasks]) => (
                  <div key={cls} style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px',
                        padding: '0 2px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: col.accent,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {cls}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '1px',
                          background: `${col.accent}20`,
                        }}
                      />
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>
                        {groupTasks.length}
                      </span>
                    </div>
                    <div
                      className="kanban-col-cards-inner"
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}
                    >
                      {groupTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          accentColor={col.accent}
                          onClick={() => onSelectTask(task)}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverCol(col.status) }}
                          onDrop={(e) => handleCardDrop(e, col.status, task.id)}
                          isDragging={draggedId === task.id}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="kanban-col-cards-inner"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}
                >
                  {sorted.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      accentColor={col.accent}
                      onClick={() => onSelectTask(task)}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverCol(col.status) }}
                      onDrop={(e) => handleCardDrop(e, col.status, task.id)}
                      isDragging={draggedId === task.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
