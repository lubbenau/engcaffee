'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await signIn(email, password)

    if (error) {
      setError('Email atau password salah. Coba lagi.')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: '#4DB89E', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            🍽️
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A1A' }}>EngCaffee</h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Login untuk akses dashboard admin</p>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', border: '0.5px solid #F0F0F0' }}>
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@engcaffee.com"
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid #E8E8E8', fontSize: '14px', color: '#1A1A1A',
                  outline: 'none', background: '#FAFAFA'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  style={{
                    width: '100%', padding: '12px 48px 12px 16px', borderRadius: '12px',
                    border: '1.5px solid #E8E8E8', fontSize: '14px', color: '#1A1A1A',
                    outline: 'none', background: '#FAFAFA'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#BBB' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FFF0F0', border: '0.5px solid #FFB3B3', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#CC3333', fontWeight: '600' }}>⚠️ {error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#B2DDD4' : '#4DB89E', color: '#fff',
                padding: '14px', borderRadius: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '700', fontSize: '15px'
              }}>
              {loading ? 'Masuk...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#BBB', marginTop: '20px' }}>
          EngCaffee Admin Panel · Protected
        </p>
      </div>
    </div>
  )
}