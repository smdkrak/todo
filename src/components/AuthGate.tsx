import { useState } from 'react'
import { CheckCircle2, Cloud, Loader2, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function AuthGate() {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInWithGoogle = async () => {
    if (!supabase) return
    setIsSending(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (authError) {
      setError(authError.message)
      setIsSending(false)
    }
  }

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase || !email.trim()) return
    setIsSending(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setIsSending(false)
    if (authError) setError(authError.message)
    else setSent(true)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo"><Cloud size={25} /></div>
        <p className="auth-eyebrow">PRIVATE CLOUD TODO</p>
        <h1>어디서든 이어서<br />정리하세요.</h1>
        <p className="auth-description">로그인한 본인만 암호화된 연결을 통해 일정과 할 일을 확인할 수 있습니다.</p>
        <button className="google-login-button" type="button" onClick={signInWithGoogle} disabled={isSending}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.54l3.35-2.62Z" />
            <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5L18.7 4.56A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.94 12 5.94Z" />
          </svg>
          Google로 계속하기
        </button>
        <div className="auth-divider"><span>또는 이메일로 로그인</span></div>
        {sent ? (
          <div className="auth-sent">
            <CheckCircle2 size={22} />
            <div><strong>로그인 링크를 보냈습니다.</strong><span>{email}의 메일함을 확인해 주세요.</span></div>
          </div>
        ) : (
          <form onSubmit={sendMagicLink}>
            <label htmlFor="login-email">이메일</label>
            <div className="auth-input"><Mail size={17} /><input id="login-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={isSending}>{isSending ? <Loader2 size={17} className="spin" /> : null}로그인 링크 받기</button>
          </form>
        )}
        <p className="auth-footnote">Google 로그인 또는 비밀번호 없는 이메일 링크를 사용할 수 있습니다.</p>
      </section>
    </main>
  )
}
