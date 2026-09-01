import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Unplug } from 'lucide-react'
import type { Task } from '../types'

interface Props { tasks: Task[] }
interface GoogleCalendarEvent { id: string; summary?: string; start?: { date?: string; dateTime?: string } }
interface GoogleTokenResponse { access_token?: string; error?: string; error_description?: string }
interface GoogleTokenClient { requestAccessToken: (options?: { prompt?: string }) => void }

declare global {
  interface Window {
    google?: {
      accounts: { oauth2: {
        initTokenClient: (config: {
          client_id: string
          scope: string
          callback: (response: GoogleTokenResponse) => void
          error_callback?: () => void
        }) => GoogleTokenClient
        revoke: (token: string, callback?: () => void) => void
      } }
    }
  }
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'
let googleScriptPromise: Promise<void> | null = null

function loadGoogleIdentityScript() {
  if (window.google?.accounts.oauth2) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google 로그인 모듈을 불러오지 못했습니다.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google 로그인 모듈을 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

function toDateKey(event: GoogleCalendarEvent) {
  const value = event.start?.date ?? event.start?.dateTime
  if (!value) return null
  if (event.start?.date) return value
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function CalendarWidget({ tasks }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([])
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const tokenClientRef = useRef<GoogleTokenClient | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const fetchGoogleEvents = useCallback(async (token: string, targetYear: number, targetMonth: number) => {
    setIsLoadingEvents(true)
    setCalendarError(null)
    try {
      const params = new URLSearchParams({
        timeMin: new Date(targetYear, targetMonth, 1).toISOString(),
        timeMax: new Date(targetYear, targetMonth + 1, 1).toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      })
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 401) {
        setAccessToken(null)
        throw new Error('Google 연결이 만료되었습니다. 다시 연결해 주세요.')
      }
      if (!response.ok) throw new Error('Google Calendar 일정을 불러오지 못했습니다.')
      const data = (await response.json()) as { items?: GoogleCalendarEvent[] }
      setGoogleEvents(data.items ?? [])
    } catch (error) {
      setGoogleEvents([])
      setCalendarError(error instanceof Error ? error.message : 'Google Calendar 연결 오류가 발생했습니다.')
    } finally {
      setIsLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    if (accessToken) void fetchGoogleEvents(accessToken, year, month)
  }, [accessToken, fetchGoogleEvents, month, year])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, GoogleCalendarEvent[]>()
    googleEvents.forEach((event) => {
      const key = toDateKey(event)
      if (key) map.set(key, [...(map.get(key) ?? []), event])
    })
    return map
  }, [googleEvents])

  const connectGoogleCalendar = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setCalendarError('Google OAuth 클라이언트 ID 설정이 필요합니다.')
      return
    }
    setIsConnecting(true)
    setCalendarError(null)
    try {
      await loadGoogleIdentityScript()
      if (!window.google) throw new Error('Google 로그인 모듈을 사용할 수 없습니다.')
      if (!tokenClientRef.current) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_CALENDAR_SCOPE,
          callback: (response) => {
            setIsConnecting(false)
            if (response.error || !response.access_token) {
              setCalendarError(response.error_description ?? 'Google Calendar 연결이 취소되었습니다.')
              return
            }
            setAccessToken(response.access_token)
          },
          error_callback: () => {
            setIsConnecting(false)
            setCalendarError('Google 로그인 창을 열지 못했습니다.')
          },
        })
      }
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' })
    } catch (error) {
      setIsConnecting(false)
      setCalendarError(error instanceof Error ? error.message : 'Google Calendar 연결 오류가 발생했습니다.')
    }
  }

  const disconnectGoogleCalendar = () => {
    if (accessToken && window.google) window.google.accounts.oauth2.revoke(accessToken)
    setAccessToken(null)
    setGoogleEvents([])
    setCalendarError(null)
  }

  const cells = []
  for (let index = 0; index < firstDay; index++) cells.push(<div key={`empty-${index}`} />)
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && day === today.getDate()
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayTasks = tasks.filter((task) => task.deadline === dateKey)
    const dayGoogleEvents = eventsByDate.get(dateKey) ?? []
    const dayItems = [
      ...dayGoogleEvents.map((event) => ({
        id: `google-${event.id}`,
        title: event.summary ?? '제목 없는 일정',
        source: 'google' as const,
      })),
      ...dayTasks.map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        source: 'task' as const,
      })),
    ]
    const isSunday = (firstDay + day - 1) % 7 === 0
    const isSaturday = (firstDay + day - 1) % 7 === 6
    cells.push(
      <div
        key={dateKey}
        title={dayItems.map((item) => item.title).join('\n') || undefined}
        className="calendar-day"
        style={{ background: isToday ? 'linear-gradient(145deg, #6768ee, #4c4dcc)' : 'transparent', cursor: dayItems.length ? 'help' : 'default' }}
      >
        <div className="calendar-day-heading">
          <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : 600, color: isToday ? '#fff' : isSunday ? '#ef4444' : isSaturday ? '#6d28d9' : '#374151' }}>{day}</span>
          {dayItems.length > 0 && <span className="calendar-day-count" style={{ color: isToday ? '#fff' : '#7c83a0', background: isToday ? 'rgba(255,255,255,.18)' : 'rgba(68,76,126,.08)' }}>{dayItems.length}</span>}
        </div>
        {dayItems.length > 0 && (
          <div className="calendar-event-list">
            {dayItems.slice(0, 2).map((item) => (
              <div key={item.id} className={`calendar-event-chip ${item.source}${isToday ? ' today' : ''}`}>
                <i />
                <span>{item.title}</span>
              </div>
            ))}
            {dayItems.length > 2 && <span className="calendar-more">+{dayItems.length - 2}</span>}
          </div>
        )}
      </div>,
    )
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="calendar-month">{year}년 {month + 1}월</span>
            {accessToken && <span className="calendar-connected-dot" title="Google Calendar 연결됨" />}
          </div>
          {calendarError && <div className="calendar-error" title={calendarError}>{calendarError}</div>}
        </div>
        <div className="calendar-actions">
          <button
            onClick={accessToken ? disconnectGoogleCalendar : connectGoogleCalendar}
            disabled={isConnecting || isLoadingEvents}
            title={accessToken ? 'Google Calendar 연결 해제' : GOOGLE_CLIENT_ID ? 'Google Calendar 연결' : '환경변수 설정 필요'}
            className={`calendar-connect-button${accessToken ? ' connected' : ''}`}
          >
            {isConnecting || isLoadingEvents ? <Loader2 size={11} className="spin" /> : accessToken ? <Unplug size={11} /> : <CalendarDays size={11} />}
            <span className="calendar-connect-label">{accessToken ? '연결됨' : 'Google'}</span>
          </button>
          <button className="calendar-nav-button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
          <button className="calendar-nav-button" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="calendar-legend">
        <span><i className="google" />Google 일정</span>
        <span><i className="task" />TODO</span>
      </div>
      <div className="calendar-weekdays">
        {DAYS.map((day, index) => <div key={day} style={{ color: index === 0 ? '#ef4444' : index === 6 ? '#6d28d9' : '#9ca3af' }}>{day}</div>)}
      </div>
      <div className="calendar-grid">{cells}</div>
    </div>
  )
}
