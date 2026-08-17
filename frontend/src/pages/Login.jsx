import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

import {
  ArrowRight,
  LockKeyhole,
  Mail,
  WalletCards,
} from 'lucide-react'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="login-page">

      <div className="auth-section">

        <div className="auth-card">

          {/* BRAND */}

          <div className="mobile-brand">

            <div className="brand-mark">
              S
            </div>

            <span>
              SpendWise
            </span>

          </div>


          {/* HEADING */}

          <div className="auth-heading">

            <div className="auth-heading-icon">

              <WalletCards
                size={20}
                strokeWidth={1.8}
              />

            </div>

            <div>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue managing your finances.
              </p>

            </div>

          </div>


          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="input-group">

              <label>
                Email address
              </label>

              <div className="auth-input-wrapper">

                <Mail
                  size={16}
                  strokeWidth={1.8}
                />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="input-group">

              <div className="password-label">

                <label>
                  Password
                </label>

                <a href="#">
                  Forgot password?
                </a>

              </div>

              <div className="auth-input-wrapper">

                <LockKeyhole
                  size={16}
                  strokeWidth={1.8}
                />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}


            {/* SIGN IN */}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >

              {loading
                ? 'Signing in...'
                : 'Sign in'}

              {!loading && (
                <ArrowRight
                  size={17}
                  strokeWidth={2}
                />
              )}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="divider">
            <span>
              or
            </span>
          </div>


          {/* REGISTER */}

          <p className="auth-footer">

            Don't have an account?{' '}

            <Link to="/register">
              Create one
            </Link>

          </p>

        </div>


        {/* SECURITY */}

        <p className="security-note">

          <LockKeyhole
            size={13}
            strokeWidth={1.8}
          />

          Your financial information is protected

        </p>

      </div>

    </div>
  )
}

export default Login