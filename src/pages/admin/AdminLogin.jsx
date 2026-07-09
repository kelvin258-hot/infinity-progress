import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'

export default function AdminLogin() {
  const { signIn, signUp, session, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('infinityprogress36@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // login | forgot

  useEffect(() => {
    if (session) navigate('/admin')
  }, [session, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'forgot') {
      const { error } = await resetPassword(email)
      setLoading(false)
      if (error) setError('Erro ao enviar email de recuperação.')
      else setError('Email de recuperação enviado! Verifique a sua caixa de entrada.')
      return
    }

    const { data, error } = await signIn(email, password)

    if (error) {
      // If user doesn't exist, try to sign up
      if (error.message.includes('Invalid login credentials') || error.message.includes('not confirmed')) {
        const { data: signUpData, error: signUpError } = await signUp(email, password)
        if (signUpError) {
          setError('Credenciais inválidas. Verifique o email e palavra-passe.')
          setLoading(false)
          return
        }
        if (signUpData?.session || signUpData?.user) {
          navigate('/admin')
          return
        }
        setError('Conta criada. Verifique o email para confirmar.')
        setLoading(false)
        return
      }
      setError(error.message)
      setLoading(false)
      return
    }

    if (data?.session) {
      navigate('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase text-white tracking-wider">Infinity Progress</h1>
          <p className="text-white/50 text-sm mt-2 uppercase tracking-wide">Área de Administração</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          {mode === 'login' ? (
            <>
              <h2 className="text-xl font-bold text-white mb-6">Iniciar Sessão</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-white/60 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase text-white/60 mb-1 block">Palavra-passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:border-brand-pink focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-xl font-bold uppercase text-sm transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'A processar...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('forgot'); setError('') }}
                className="w-full text-white/50 hover:text-brand-pink text-sm mt-4 transition-colors"
              >
                Esqueci a palavra-passe
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <KeyRound size={20} /> Recuperar Palavra-passe
              </h2>
              <p className="text-white/50 text-sm mb-4">
                Introduza o seu email para receber um código de recuperação.
              </p>
              <div>
                <label className="text-xs uppercase text-white/60 mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:border-brand-pink focus:outline-none"
                  />
                </div>
              </div>
              {error && <p className="text-brand-pink text-sm mt-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-xl font-bold uppercase text-sm transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'A enviar...' : 'Enviar Código'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setError('') }}
                className="w-full text-white/50 hover:text-brand-pink text-sm mt-4 transition-colors"
              >
                Voltar ao login
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
