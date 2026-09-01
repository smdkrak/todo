import { useState, useMemo, useEffect, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { NoticePanel } from './components/NoticePanel'
import { CalendarWidget } from './components/CalendarWidget'
import { KanbanBoard } from './components/KanbanBoard'
import { TaskModal } from './components/TaskModal'
import { NoticeListModal } from './components/NoticeListModal'
import { AuthGate } from './components/AuthGate'
import { Search, Layers, X, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { Category, Task, TaskStatus, Notice } from './types'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { loadTodoData, removeNotice, removeTask, saveCategory, saveNotice, saveTask } from './lib/database'

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
  accent: '#5b5ce2',
  accentDim: 'rgba(91,92,226,0.10)',
  text1: '#171a33',
  text2: '#5f667f',
  text3: '#9299ad',
  border: 'rgba(31,38,75,0.09)',
  surface: '#ffffff',
  bg: '#eef1f8',
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
  const [session, setSession] = useState<Session | null>(null)
  const [isCloudLoading, setIsCloudLoading] = useState(isSupabaseConfigured)
  const [cloudError, setCloudError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) setIsCloudLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    let active = true
    setIsCloudLoading(true)
    setCloudError(null)
    void loadTodoData()
      .then(async (data) => {
        if (!active) return
        if (data.categories.length === 0) {
          await Promise.all(initialCategories.map((category) => saveCategory(session.user.id, category)))
          if (!active) return
          setCategories(initialCategories)
          setTasks([])
          setNotices([])
          setActiveCategoryId(initialCategories[0].id)
        } else {
          setCategories(data.categories)
          setTasks(data.tasks)
          setNotices(data.notices)
          setActiveCategoryId((current) => data.categories.some((category) => category.id === current) ? current : data.categories[0].id)
        }
      })
      .catch((error) => setCloudError(error instanceof Error ? error.message : '클라우드 데이터를 불러오지 못했습니다.'))
      .finally(() => { if (active) setIsCloudLoading(false) })
    return () => { active = false }
  }, [session])

  const syncSafely = (operation: Promise<unknown>) => {
    if (!session) return
    setCloudError(null)
    void operation.catch((error) => setCloudError(error instanceof Error ? error.message : '클라우드 저장에 실패했습니다.'))
  }

  const refreshGoogleAuthorization = useCallback(async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    if (!supabaseUrl) return
    const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`)
    authorizeUrl.searchParams.set('provider', 'google')
    authorizeUrl.searchParams.set('redirect_to', window.location.origin)
    authorizeUrl.searchParams.set('scopes', 'https://www.googleapis.com/auth/calendar.readonly')
    authorizeUrl.searchParams.set('access_type', 'offline')
    authorizeUrl.searchParams.set('prompt', 'consent')
    authorizeUrl.searchParams.set('include_granted_scopes', 'true')
    window.location.assign(authorizeUrl.toString())
  }, [])

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
      const task = { ...taskData, id: `task-${Date.now()}` }
      setTasks((prev) => [...prev, task])
      if (session) syncSafely(saveTask(session.user.id, task))
    } else if (selectedTask) {
      const task = { ...selectedTask, ...taskData }
      setTasks((prev) => prev.map((item) => (item.id === selectedTask.id ? task : item)))
      if (session) syncSafely(saveTask(session.user.id, task))
    }
    setSelectedTask(null)
    setIsCreatingTask(false)
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedTask(null)
    setIsCreatingTask(false)
    if (session) syncSafely(removeTask(id))
  }

  const handleUpdateTaskStatus = (id: string, newStatus: TaskStatus) => {
    const task = tasks.find((item) => item.id === id)
    setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
    if (session && task) syncSafely(saveTask(session.user.id, { ...task, status: newStatus }))
  }

  const handleAddNotice = (text: string, date?: string) => {
    const notice = { id: `n-${Date.now()}`, text, date }
    setNotices((prev) => [...prev, notice])
    if (session) syncSafely(saveNotice(session.user.id, notice))
  }

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id))
    if (session) syncSafely(removeNotice(id))
  }

  const handleUpdateNotice = (id: string, text: string, date?: string) => {
    const notice = { id, text, date }
    setNotices((prev) => prev.map((item) => (item.id === id ? notice : item)))
    if (session) syncSafely(saveNotice(session.user.id, notice))
  }

  const handleAddCategory = () => {
    const name = prompt('새 카테고리 이름:')
    if (name) {
      const newCat = { id: `cat-${Date.now()}`, name }
      setCategories((prev) => [...prev, newCat])
      setActiveCategoryId(newCat.id)
      if (session) syncSafely(saveCategory(session.user.id, newCat))
    }
  }

  const todoCount = (catId: string) =>
    tasks.filter((t) => t.category === catId && t.status === 'todo').length

  if (isSupabaseConfigured && !session && !isCloudLoading) return <AuthGate />

  if (isSupabaseConfigured && isCloudLoading) {
    return <div className="cloud-loading"><div className="cloud-loading-orbit" /><span>클라우드 데이터를 불러오는 중...</span></div>
  }

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
        className="app-shell"
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
          style={{ boxShadow: '0 18px 48px rgba(30,35,75,0.08)' }}
        >
          {/* Notice panel */}
          <div className="top-panel notice-shell" style={{ borderRight: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
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
            className="center-col top-panel"
            style={{
              background: 'rgba(248,249,255,0.82)',
              borderRight: `1px solid ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px',
            }}
          >
            {/* Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '14px',
                padding: '11px 16px',
                width: '85%',
                border: '1px solid rgba(17,24,39,0.09)',
                boxShadow: '0 10px 28px rgba(38,45,92,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
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
                  fontSize: '14px',
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
                padding: '11px 22px',
                background: 'linear-gradient(135deg, #6768ee 0%, #4c4dcc 100%)',
                color: '#fff',
                borderRadius: '13px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                boxShadow: '0 10px 24px rgba(76,77,204,0.28), inset 0 1px 0 rgba(255,255,255,0.24)',
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
          <div className="top-panel calendar-shell" style={{ overflow: 'hidden' }}>
            <CalendarWidget tasks={tasks} googleAccessToken={session?.provider_token} onGoogleAuthorizationRequired={refreshGoogleAuthorization} />
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="category-bar scroll-hidden"
          style={{
            flexShrink: 0,
            height: '58px',
            display: 'flex',
            alignItems: 'center',
            background: C.surface,
            padding: '0 26px',
            gap: '4px',
            borderBottom: `1px solid ${C.border}`,
            boxShadow: '0 10px 30px rgba(30,35,75,0.06)',
            overflowX: 'auto',
            zIndex: 20,
          }}
        >
          {session && (
            <div className="cloud-session-wrap">
              <div className="cloud-session" title={cloudError ?? session.user.email ?? '클라우드 연결됨'}>
                <span className={cloudError ? 'error' : ''} />
                {cloudError ? '동기화 오류' : '클라우드 동기화'}
              </div>
              <button className="cloud-signout" onClick={() => void supabase?.auth.signOut()}>로그아웃</button>
            </div>
          )}
          <span
            style={{
              fontSize: '11px',
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
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: isActive ? C.text1 : 'transparent',
                  color: isActive ? '#fff' : C.text2,
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                  flexShrink: 0,
                  boxShadow: isActive ? '0 7px 18px rgba(26,28,58,0.22), inset 0 1px 0 rgba(255,255,255,0.16)' : 'none',
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
              fontSize: '13px',
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
