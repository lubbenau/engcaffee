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

  async function handleLogin(e) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError('Email atau password salah')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f172a',
        padding: '20px'
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#111827',
          padding: '30px',
          borderRadius: '20px',
          color: 'white'
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: '1px solid #374151',
            background: '#1f2937',
            color: 'white'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: '1px solid #374151',
            background: '#1f2937',
            color: 'white'
          }}
        />

        {error && (
          <p
            style={{
              color: '#f87171',
              marginBottom: '16px'
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}