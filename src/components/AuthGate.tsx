import { useState } from 'react'
import { CheckCircle2, Cloud, Loader2, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function AuthGate() {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        <p className="auth-footnote">비밀번호를 저장하지 않는 이메일 매직링크 방식입니다.</p>
      </section>
    </main>
  )
}
