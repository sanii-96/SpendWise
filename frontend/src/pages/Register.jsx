import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
  WalletCards,
  CircleCheck,
  CircleAlert,
} from 'lucide-react'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      )
      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(
      'Account created! Check your email to verify your account.'
    )

    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-page">

      {/* =========================
          LEFT SHOWCASE
      ========================= */}

      <div className="auth-showcase">

        {/* BRAND */}

        <div className="showcase-brand">

          <div className="brand-mark">
            S
          </div>

          <span>
            SpendWise
          </span>

        </div>


        {/* SHOWCASE CONTENT */}

        <div className="showcase-content">

          <p className="eyebrow">
            PERSONAL FINANCE, SIMPLIFIED
          </p>

          <h1>
            Smart finance,
            <span> made simple.</span>
          </h1>

          <p className="showcase-description">
            Everything you need to understand your spending,
            manage your budgets, and make better financial
            decisions.
          </p>


          {/* FEATURES */}

          <div className="showcase-features">

            {/* FEATURE 1 */}

            <div className="showcase-feature">

              <div className="feature-icon">
                <span>↗</span>
              </div>

              <div className="feature-content">

                <h3>
                  Track your spending
                </h3>

                <p>
                  See exactly where your money goes.
                </p>

              </div>

            </div>


            {/* FEATURE 2 */}

            <div className="showcase-feature">

              <div className="feature-icon">
                <span>◎</span>
              </div>

              <div className="feature-content">

                <h3>
                  Manage your budgets
                </h3>

                <p>
                  Set limits and stay ahead of your expenses.
                </p>

              </div>

            </div>


            {/* FEATURE 3 */}

            <div className="showcase-feature">

              <div className="feature-icon">
                <span>✓</span>
              </div>

              <div className="feature-content">

                <h3>
                  Understand your money
                </h3>

                <p>
                  Turn your financial activity into clear
                  insights.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <p className="showcase-footer">
          Your money deserves a smarter system.
        </p>

      </div>


      {/* =========================
          REGISTER SECTION
      ========================= */}

      <div className="auth-section">

        <div className="auth-card">


          {/* MOBILE BRAND */}

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
                Create your account
              </h2>

              <p>
                Start managing your money with SpendWise.
              </p>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="form-message error-message">

              <CircleAlert
                size={16}
                strokeWidth={1.8}
              />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="form-message success-message">

              <CircleCheck
                size={16}
                strokeWidth={1.8}
              />

              <span>
                {success}
              </span>

            </div>

          )}


          {/* REGISTER FORM */}

          <form onSubmit={handleRegister}>

            {/* NAME */}

            <div className="input-group">

              <label>
                Full name
              </label>

              <div className="auth-input-wrapper">

                <UserRound
                  size={16}
                  strokeWidth={1.8}
                />

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

            </div>


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

              <label>
                Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole
                  size={16}
                  strokeWidth={1.8}
                />

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

              </div>

              <span className="password-hint">
                Minimum 6 characters
              </span>

            </div>


            {/* BUTTON */}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >

              {loading
                ? 'Creating account...'
                : 'Create account'}

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


          {/* LOGIN LINK */}

          <p className="auth-footer">

            Already have an account?{' '}

            <Link to="/login">
              Sign in
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

export default Register