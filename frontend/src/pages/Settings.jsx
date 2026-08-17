import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Settings() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState('')
  const [currency, setCurrency] = useState('INR')

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingCurrency, setSavingCurrency] = useState(false)

  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    setUser(user)

    setUserName(
      user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        ''
    )

    setCurrency(
      user.user_metadata?.currency || 'INR'
    )

    setLoading(false)
  }

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setMessage('')

    const { error } =
      await supabase.auth.updateUser({
        data: {
          name: userName,
        },
      })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(
        'Profile updated successfully!'
      )
    }

    setSavingProfile(false)
  }

  // =========================
  // SAVE CURRENCY
  // =========================

  const handleSaveCurrency = async () => {
    setSavingCurrency(true)
    setMessage('')

    const { error } =
      await supabase.auth.updateUser({
        data: {
          currency: currency,
        },
      })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(
        'Currency preference saved successfully!'
      )
    }

    setSavingCurrency(false)
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard">

        <main className="dashboard-main">

          <div className="no-transactions">

            <div>
              ⏳
            </div>

            <h3>
              Loading settings...
            </h3>

          </div>

        </main>

      </div>
    )
  }

  return (
    <div className="dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-mark">
            S
          </div>

          <span>
            SpendWise
          </span>

        </div>

        <nav className="sidebar-nav">

          <p className="nav-title">
            MENU
          </p>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Overview
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/transactions')
            }
          >
            <span>↔</span>
            Transactions
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/budgets')
            }
          >
            <span>◫</span>
            Budgets
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/analytics')
            }
          >
            <span>◔</span>
            Analytics
          </button>

          <p className="nav-title second-title">
            OTHER
          </p>

          <button
            className="nav-item active"
            onClick={() =>
              navigate('/settings')
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">
              {userName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {userName}
              </strong>

              <span>
                Personal account
              </span>

            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <p className="dashboard-greeting">
              Settings ⚙️
            </p>

            <h1>
              Manage your account and preferences.
            </h1>

          </div>

        </header>

        {/* =========================
            PROFILE
        ========================= */}

        <section className="dashboard-panel settings-section">

          <div className="panel-header">

            <div>

              <h3>
                Profile
              </h3>

              <p>
                Manage your personal information
              </p>

            </div>

          </div>

          <div className="settings-field">

            <label>
              NAME
            </label>

            <input
              type="text"
              value={userName}
              onChange={(e) =>
                setUserName(e.target.value)
              }
              placeholder="Enter your name"
            />

          </div>

          <div className="settings-field">

            <label>
              EMAIL
            </label>

            <input
              type="email"
              value={user?.email || ''}
              disabled
            />

          </div>

          <button
            className="settings-save-btn"
            onClick={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile
              ? 'Saving...'
              : 'Save Profile'}
          </button>

          {message && (
            <p className="settings-message">
              {message}
            </p>
          )}

        </section>

        {/* =========================
            PREFERENCES
        ========================= */}

        <section className="dashboard-panel settings-section">

          <div className="panel-header">

            <div>

              <h3>
                Preferences
              </h3>

              <p>
                Customize your SpendWise preferences
              </p>

            </div>

          </div>

          <div className="settings-field">

            <label>
              CURRENCY
            </label>

            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value)
              }
            >

              <option value="INR">
                ₹ Indian Rupee (INR)
              </option>

              <option value="USD">
                $ US Dollar (USD)
              </option>

              <option value="EUR">
                € Euro (EUR)
              </option>

              <option value="GBP">
                £ British Pound (GBP)
              </option>

            </select>

          </div>

          <button
            className="settings-save-btn"
            onClick={handleSaveCurrency}
            disabled={savingCurrency}
          >
            {savingCurrency
              ? 'Saving...'
              : 'Save Currency'}
          </button>

        </section>

        {/* =========================
            ACCOUNT
        ========================= */}

        <section className="dashboard-panel settings-section settings-danger">

          <div className="panel-header">

            <div>

              <h3>
                Account
              </h3>

              <p>
                Manage your SpendWise account
              </p>

            </div>

          </div>

          <button
            className="settings-logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </section>

      </main>

    </div>
  )
}

export default Settings