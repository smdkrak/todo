import { useState, useMemo } from 'react'
import { NoticePanel } from './components/NoticePanel'
import { CalendarWidget } from './components/CalendarWidget'
import { KanbanBoard } from './components/KanbanBoard'
import { TaskModal } from './components/TaskModal'
import { NoticeListModal } from './components/NoticeListModal'
import { Search, Layers, X, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { Category, Task, TaskStatus, Notice } from './types'

const initialNotices: Notice[] = [
  { id: 'n1', text: '9월 전체 팀 미팅 — 오전 10시 (대회의실 A)', date: '2026-09-05' },
  { id: 'n2', text: 'Q3 성과 보고서 제출 마감', date: '2026-09-10' },
]

const initialCategories: Category[] = [
  { id: 'work', name: '업무' },
  { id: 'life', name: '일상' },
]

const initialTasks: Task[] = [
  { id: 'w1', title: 'Q3 프로젝트 기획서 작성', status: 'todo', category: 'work', classification: '긴급', deadline: '2026-09-05' },
  { id: 'w2', title: 'UI 디자인 시안 검토', status: 'todo', category: 'work', classification: '중요', deadline: '2026-09-03' },
  { id: 'l1', title: '헬스장 6개월 등록', status: 'todo', category: 'life', classification: '루틴' },
]

/* ── colours ── */
const C = {
  accent: '#4338ca',
  accentDim: 'rgba(67,56,202,0.08)',
  text1: '#1a1c3a',
  text2: '#6b7280',
  text3: '#9ca3af',
  border: 'rgba(17,24,39,0.08)',
  surface: '#ffffff',
  bg: '#edf0f8',
}

export default function App() {
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeCategoryId, setActiveCategoryId] = useState<string>('work')

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo')

  const [showNoticeList, setShowNoticeList] = useState(false)
  const [showGatherModal, setShowGatherModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  /* mobile collapse */
  const [isTopCollapsed, setIsTopCollapsed] = useState(false)
  const [isKanbanCollapsed, setIsKanbanCollapsed] = useState(false)

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.category === activeCategoryId)
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    return filtered
  }, [tasks, activeCategoryId, searchQuery])

  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status)
    setSelectedTask(null)
    setIsCreatingTask(true)
  }

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task)
    setIsCreatingTask(false)
  }

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (isCreatingTask) {
      setTasks((prev) => [...prev, { ...taskData, id: `task-${Date.now()}` }])
    } else if (selectedTask) {
      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? { ...t, ...taskData } : t)))
    }
    setSelectedTask(null)
    setIsCreatingTask(false)
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedTask(null)
    setIsCreatingTask(false)
  }

  const handleUpdateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  const handleAddNotice = (text: string, date?: string) => {
    setNotices((prev) => [...prev, { id: `n-${Date.now()}`, text, date }])
  }

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id))
  }

  const handleUpdateNotice = (id: string, text: string, date?: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, text, date } : n)))
  }

  const handleAddCategory = () => {
    const name = prompt('새 카테고리 이름:')
    if (name) {
      const newCat = { id: `cat-${Date.now()}`, name }
      setCategories((prev) => [...prev, newCat])
      setActiveCategoryId(newCat.id)
    }
  }

  const todoCount = (catId: string) =>
    tasks.filter((t) => t.category === catId && t.status === 'todo').length

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .top-collapse-btn { display: flex !important; }
          .kanban-collapse-btn { display: flex !important; }
        }
        .top-collapse-btn { display: none; }
        .kanban-collapse-btn { display: none; }
      `}</style>

      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: C.bg,
          fontFamily: "'DM Sans', 'Noto Sans KR', system-ui, sans-serif",
        }}
      >
        {/* ── Top section ── */}
        <div
          className={`top-section${isTopCollapsed ? ' top-collapsed' : ''}${isKanbanCollapsed ? ' kanban-collapsed' : ''}`}
          style={{ boxShadow: '0 1px 0 rgba(17,24,39,0.07), 0 4px 20px rgba(67,56,202,0.05)' }}
        >
          {/* Notice panel */}
          <div style={{ borderRight: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
            <NoticePanel
              notices={notices}
              onAddNotice={handleAddNotice}
              onDeleteNotice={handleDeleteNotice}
              onUpdateNotice={handleUpdateNotice}
              onShowList={() => setShowNoticeList(true)}
            />
            {/* mobile collapse toggle for top section */}
            <button
              className="top-collapse-btn"
              onClick={() => setIsTopCollapsed((v) => !v)}
              title={isTopCollapsed ? '공지/달력 열기' : '공지/달력 닫기'}
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                zIndex: 10,
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: `1px solid ${C.border}`,
                background: '#fff',
                color: C.text3,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}
            >
              {isTopCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          </div>

          {/* Center — search + gather */}
          <div
            className="center-col"
            style={{
              background: '#f9faff',
              borderRight: `1px solid ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '20px',
            }}
          >
            {/* Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '10px',
                padding: '9px 14px',
                width: '85%',
                border: '1px solid rgba(17,24,39,0.09)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                gap: '8px',
              }}
            >
              <Search size={15} style={{ color: C.text3, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="항목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  fontSize: '13px',
                  color: C.text1,
                  background: 'transparent',
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, display: 'flex' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Gather button */}
            <button
              onClick={() => setShowGatherModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 20px',
                background: C.accent,
                color: '#fff',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                boxShadow: '0 4px 14px rgba(67,56,202,0.28)',
                transition: 'opacity 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Layers size={15} />
              모아보기
            </button>
          </div>

          {/* Calendar */}
          <div style={{ overflow: 'hidden' }}>
            <CalendarWidget tasks={tasks} />
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          style={{
            flexShrink: 0,
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            background: C.surface,
            padding: '0 20px',
            gap: '4px',
            borderBottom: `1px solid ${C.border}`,
            boxShadow: '0 1px 0 rgba(17,24,39,0.04)',
            overflowX: 'auto',
            zIndex: 20,
          }}
          className="scroll-hidden"
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: C.text3,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginRight: '10px',
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            카테고리
          </span>

          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id
            const count = todoCount(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: isActive ? C.text1 : 'transparent',
                  color: isActive ? '#fff' : C.text2,
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                  flexShrink: 0,
                  boxShadow: isActive ? '0 2px 8px rgba(26,28,58,0.20)' : 'none',
                }}
              >
                {cat.name}
                {count > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(255,255,255,0.25)' : C.accentDim,
                      color: isActive ? '#fff' : C.accent,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          <button
            onClick={handleAddCategory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'transparent',
              border: `1px dashed ${C.border}`,
              color: C.text3,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'border-color 0.15s, color 0.15s',
              fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accent
              e.currentTarget.style.color = C.accent
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.color = C.text3
            }}
          >
            <Plus size={12} />
            추가
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Mobile kanban collapse toggle */}
          <button
            className="kanban-collapse-btn"
            onClick={() => setIsKanbanCollapsed((v) => !v)}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${C.border}`,
              background: isKanbanCollapsed ? C.accentDim : 'transparent',
              color: isKanbanCollapsed ? C.accent : C.text3,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isKanbanCollapsed ? (
              <>
                <ChevronDown size={12} />
                보드 열기
              </>
            ) : (
              <>
                <ChevronUp size={12} />
                보드 닫기
              </>
            )}
          </button>
        </div>

        {/* ── Kanban board ── */}
        <div className={`kanban-wrapper${isKanbanCollapsed ? ' kanban-collapsed' : ''}`}>
          <KanbanBoard
            tasks={filteredTasks}
            onSelectTask={handleSelectTask}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </div>

        {/* ── Task modal ── */}
        {(selectedTask || isCreatingTask) && (
          <TaskModal
            task={selectedTask}
            defaultStatus={newTaskStatus}
            defaultCategory={activeCategoryId}
            categories={categories}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            onClose={() => {
              setSelectedTask(null)
              setIsCreatingTask(false)
            }}
          />
        )}

        {/* ── Notice list modal ── */}
        {showNoticeList && (
          <NoticeListModal
            notices={notices}
            onDelete={handleDeleteNotice}
            onAdd={handleAddNotice}
            onClose={() => setShowNoticeList(false)}
          />
        )}

        {/* ── Gather modal ── */}
        {showGatherModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,18,40,0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowGatherModal(false)}
          >
            <div
              className="animate-modal"
              style={{
                background: '#fff',
                width: '560px',
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '16px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderBottom: `1px solid ${C.border}`,
                  flexShrink: 0,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: C.text1 }}>
                    모아보기
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
                    {categories.find((c) => c.id === activeCategoryId)?.name || '전체'} 카테고리
                  </p>
                </div>
                <button
                  onClick={() => setShowGatherModal(false)}
                  style={{
                    background: 'rgba(17,24,39,0.06)',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    color: C.text2,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(17,24,39,0.10)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(17,24,39,0.06)')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="scroll-thin" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(
                  [
                    { status: 'todo', label: 'TODO', accent: '#4338ca' },
                    { status: 'doing', label: 'DOING', accent: '#6d28d9' },
                    { status: 'done', label: 'DONE', accent: '#047857' },
                  ] as const
                ).map(({ status, label, accent }) => {
                  const statusTasks = tasks.filter((t) => t.status === status && t.category === activeCategoryId)
                  return (
                    <div key={status}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            color: accent,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {label}
                        </span>
                        <div style={{ flex: 1, height: '1px', background: `${accent}20` }} />
                        <span style={{ fontSize: '11px', color: C.text3, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                          {statusTasks.length}건
                        </span>
                      </div>
                      {statusTasks.length === 0 ? (
                        <p style={{ fontSize: '13px', color: C.text3, margin: 0, paddingLeft: '2px' }}>항목 없음</p>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {statusTasks.map((t) => (
                            <li
                              key={t.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                fontSize: '13px',
                                color: C.text1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: 'rgba(17,24,39,0.025)',
                                border: `1px solid rgba(17,24,39,0.05)`,
                                fontFamily: "'Noto Sans KR', sans-serif",
                              }}
                            >
                              <div
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: accent,
                                  flexShrink: 0,
                                  marginTop: '5px',
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600 }}>{t.title}</span>
                                {t.classification && (
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      fontSize: '11px',
                                      color: accent,
                                      background: `${accent}12`,
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {t.classification}
                                  </span>
                                )}
                                {t.deadline && (
                                  <span style={{ marginLeft: '8px', fontSize: '11px', color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
                                    ~{t.deadline.slice(5).replace('-', '/')}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
