// Logowanie i rejestracja.
import { useState, useEffect } from 'react';
import { S, pageBg, vignette, panel, goldBtn, Logo, Diamond, OnlineBadge } from './siteStyle';

const FEATURES = [
  { icon: '⚔', title: 'Walka',       desc: 'Pokonuj potwory i innych graczy' },
  { icon: '👥', title: 'Społeczność', desc: 'Twórz gildie i zawieraj przyjaźnie' },
  { icon: '🧭', title: 'Eksploracja', desc: 'Odkrywaj nieznane krainy' },
  { icon: '📈', title: 'Rozwój',      desc: 'Zdobywaj poziomy i legendarny ekwipunek' },
];

function useNarrow(bp = 980) {
  const [n, setN] = useState(typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const on = () => setN(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return n;
}

function Field({ icon, type = 'text', value, onChange, placeholder, autoComplete, onEnter, autoFocus }) {
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
      background: 'rgba(6,9,18,0.9)',
      border: `1px solid ${focus ? S.gold : S.lineSoft}`,
      borderRadius: 10, marginBottom: 12,
      boxShadow: focus ? `0 0 0 3px rgba(231,193,88,0.12)` : 'none',
      transition: 'border-color .15s, box-shadow .15s',
    }}>
      <span style={{ color: focus ? S.gold : S.dim, fontSize: 14 }}>{icon}</span>
      <input
        type={isPass && show ? 'text' : type}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        autoComplete={autoComplete} autoFocus={autoFocus}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{
          flex: 1, padding: '14px 0', background: 'none', border: 'none', outline: 'none',
          color: S.text, fontSize: 14, fontFamily: S.sans,
        }}
      />
      {isPass && (
        <button type="button" onClick={() => setShow(v => !v)} title={show ? 'Ukryj' : 'Pokaż'} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: 14, padding: 4,
        }}>{show ? '🙈' : '👁'}</button>
      )}
    </div>
  );
}

export default function AuthScreen({ mode = 'login', stats, onBack, onDone, apiFetch }) {
  const narrow = useNarrow();
  const [tab, setTab] = useState(mode);
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setErr(''); }, [tab]);

  const submit = async () => {
    if (busy) return;
    setErr(''); setBusy(true);
    try {
      if (tab === 'login') {
        const r = await apiFetch('POST', '/auth/login', { login, haslo: pass, rememberMe: remember });
        if (r?.ok) onDone(!!r.isAdmin); else setErr(r?.error || 'Nie udało się zalogować');
      } else {
        const r = await apiFetch('POST', '/auth/register', { login, haslo: pass, powtorzHaslo: pass2 });
        if (r?.ok) onDone(false); else setErr(r?.error || 'Nie udało się założyć konta');
      }
    } catch {
      setErr('Brak połączenia z serwerem');
    } finally { setBusy(false); }
  };

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: '12px 10px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: S.serif, fontSize: 14, letterSpacing: 0.5,
      color: tab === id ? S.gold : S.dim,
      background: tab === id ? 'rgba(231,193,88,0.1)' : 'transparent',
      border: `1px solid ${tab === id ? S.line : 'transparent'}`, borderRadius: 9,
    }}>{icon} {label}</button>
  );

  return (
    <div className="vh-min" style={{ position: 'relative', color: S.text, fontFamily: S.sans }}>
      {/* Autouzupełnianie przeglądarki potrafi wstawić białe tło — wymuszamy ciemne */}
      <style>{`
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #070a12 inset !important;
          -webkit-text-fill-color: ${S.text} !important;
          caret-color: ${S.text};
          transition: background-color 9999s ease-out 0s;
        }
      `}</style>
      <div style={pageBg} />
      <div style={vignette} />

      <header style={{
        position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center',
        padding: narrow ? '14px 14px 0' : '18px 28px 0', gap: 14,
      }}>
        <Logo size={narrow ? 18 : 22} sub={narrow ? null : 'ONLINE RPG'} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <OnlineBadge online={stats?.online} />
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: S.muted, fontSize: 13, fontFamily: S.sans,
          }}>← Powrót na stronę</button>
        </div>
      </header>

      <main style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46,
        padding: narrow ? '22px 14px 40px' : '30px 28px 50px',
        minHeight: 'calc(100dvh - 90px)', flexWrap: 'wrap',
      }}>
        {/* Karta logowania */}
        <div style={{ ...panel, width: 430, maxWidth: '100%', padding: narrow ? 22 : 30 }}>
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <Logo size={narrow ? 28 : 34} sub="ONLINE RPG" />
          </div>
          <p style={{ textAlign: 'center', color: S.muted, fontSize: 13, margin: '10px 0 20px' }}>
            {tab === 'login' ? 'Zaloguj się i wróć do świata pełnego przygód' : 'Załóż konto i rozpocznij przygodę'}
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {tabBtn('login', 'Logowanie', '👤')}
            {tabBtn('register', 'Rejestracja', '⚔')}
          </div>

          <Field icon="👤" value={login} onChange={setLogin} placeholder="Nazwa użytkownika"
                 autoComplete="username" autoFocus onEnter={submit} />
          <Field icon="🔒" type="password" value={pass} onChange={setPass} placeholder="Hasło"
                 autoComplete={tab === 'login' ? 'current-password' : 'new-password'} onEnter={submit} />
          {tab === 'register' && (
            <Field icon="🔒" type="password" value={pass2} onChange={setPass2} placeholder="Powtórz hasło"
                   autoComplete="new-password" onEnter={submit} />
          )}

          {tab === 'login' && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px',
              color: S.muted, fontSize: 12, cursor: 'pointer',
            }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Pamiętaj mnie przez 30 dni
            </label>
          )}

          {err && (
            <div style={{
              margin: '0 0 14px', padding: '10px 12px', borderRadius: 9,
              background: 'rgba(120,30,20,0.28)', border: '1px solid rgba(229,98,76,0.45)',
              color: '#ffb3a6', fontSize: 12.5,
            }}>{err}</div>
          )}

          <button onClick={submit} disabled={busy} style={{
            ...goldBtn(true), width: '100%', opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer',
          }}>
            {busy ? 'Chwileczkę…' : tab === 'login' ? '⚔ Zaloguj się do Veldorii →' : '⚔ Załóż konto →'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16, color: S.muted, fontSize: 12.5 }}>
            {tab === 'login' ? (
              <>Nie masz konta?{' '}
                <button onClick={() => setTab('register')} style={linkBtn}>Zarejestruj się i dołącz do przygody!</button>
              </>
            ) : (
              <>Masz już konto?{' '}
                <button onClick={() => setTab('login')} style={linkBtn}>Zaloguj się</button>
              </>
            )}
          </div>
        </div>

        {/* Lista cech */}
        {!narrow && (
          <div style={{ width: 330 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0' }}>
                  <span style={{
                    width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center',
                    borderRadius: '50%', border: `1px solid ${S.line}`, background: 'rgba(8,12,22,0.7)',
                    fontSize: 19,
                  }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: S.serif, fontSize: 16, color: S.gold }}>{f.title}</div>
                    <div style={{ color: S.muted, fontSize: 12.5, marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
                {i < FEATURES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
                    <span style={{ flex: 1, height: 1, background: S.lineSoft }} />
                    <Diamond size={5} />
                    <span style={{ flex: 1, height: 1, background: S.lineSoft }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const linkBtn = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  color: S.gold, fontSize: 12.5, fontFamily: S.sans, textDecoration: 'underline',
};
