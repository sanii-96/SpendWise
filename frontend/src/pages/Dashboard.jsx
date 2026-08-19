import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Bell,
  Plus,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  GraduationCap,
  Clapperboard,
  CreditCard,
  Clock3,
  ArrowRight,
} from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // User-specific information
  const [userName, setUserName] = useState('')
  const [currency, setCurrency] = useState('INR')

  // =========================
  // LOAD USER + DASHBOARD DATA
  // =========================

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  const checkUserAndFetchData = async () => {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    // Get user's name from Supabase metadata
    const name =
      user.user_metadata?.name?.trim() ||
      user.email?.split('@')[0] ||
      'User'

    setUserName(name)

    // Load saved currency
    setCurrency(
      user.user_metadata?.currency || 'INR'
    )

    // =========================
    // FETCH TRANSACTIONS
    // =========================

    const {
      data: transactionData,
      error: transactionError,
    } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (transactionError) {
      console.error(
        'Error fetching dashboard transactions:',
        transactionError
      )

      setError(transactionError.message)
      setLoading(false)
      return
    }

    // =========================
    // FETCH CURRENT MONTH BUDGETS
    // =========================

    const now = new Date()

    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const currentMonthStart = `${currentYear}-${String(
      currentMonth + 1
    ).padStart(2, '0')}-01`

    const nextMonthDate = new Date(
      currentYear,
      currentMonth + 1,
      1
    )

    const nextMonthStart = `${nextMonthDate.getFullYear()}-${String(
      nextMonthDate.getMonth() + 1
    ).padStart(2, '0')}-01`

    const {
      data: budgetData,
      error: budgetError,
    } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .gte('month', currentMonthStart)
      .lt('month', nextMonthStart)

    if (budgetError) {
      console.error(
        'Error fetching dashboard budgets:',
        budgetError
      )

      setError(budgetError.message)
      setLoading(false)
      return
    }

    setTransactions(transactionData || [])
    setBudgets(budgetData || [])
    setLoading(false)
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // =========================
  // CALCULATE TOTAL INCOME
  // =========================

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type?.toLowerCase() === 'income'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  // =========================
  // CALCULATE TOTAL EXPENSES
  // =========================

  const totalExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type?.toLowerCase() === 'expense'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  // =========================
  // BALANCE
  // =========================

  const balance = totalIncome - totalExpenses

  // =========================
  // SAVINGS RATE
  // =========================

  const savingsRate =
    totalIncome > 0
      ? (balance / totalIncome) * 100
      : 0

  // =========================
  // CURRENT MONTH BUDGET
  // =========================

  const monthlyBudget = budgets.reduce(
    (total, budget) =>
      total + Number(budget.amount || 0),
    0
  )

  const now = new Date()

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthStart = new Date(
    currentYear,
    currentMonth,
    1
  )

  const nextMonthStart = new Date(
    currentYear,
    currentMonth + 1,
    1
  )

  // =========================
  // CURRENT MONTH EXPENSES
  // =========================

  const monthlySpent = transactions
    .filter((transaction) => {
      const transactionDate = new Date(
        transaction.date
      )

      return (
        transaction.type?.toLowerCase() === 'expense' &&
        transactionDate >= monthStart &&
        transactionDate < nextMonthStart
      )
    })
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  const budgetRemaining =
    monthlyBudget - monthlySpent

  const budgetPercentage =
    monthlyBudget > 0
      ? (monthlySpent / monthlyBudget) * 100
      : 0

  const safeBudgetPercentage = Math.min(
    Math.max(budgetPercentage, 0),
    100
  )

  // =========================
  // WEEKLY SPENDING DATA
  // =========================

  const startOfWeek = new Date(now)

  const currentDay = now.getDay()

  const daysFromMonday =
    currentDay === 0
      ? 6
      : currentDay - 1

  startOfWeek.setDate(
    now.getDate() - daysFromMonday
  )

  startOfWeek.setHours(0, 0, 0, 0)

  const weeklySpending = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(startOfWeek)

      date.setDate(
        startOfWeek.getDate() + index
      )

      const amount = transactions
        .filter((transaction) => {
          const transactionDate = new Date(
            transaction.date
          )

          return (
            transaction.type?.toLowerCase() ===
              'expense' &&
            transactionDate.getFullYear() ===
              date.getFullYear() &&
            transactionDate.getMonth() ===
              date.getMonth() &&
            transactionDate.getDate() ===
              date.getDate()
          )
        })
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0
        )

      return {
        day: date.toLocaleDateString('en-IN', {
          weekday: 'short',
        }),
        amount,
      }
    }
  )

  const maxDailySpending = Math.max(
    ...weeklySpending.map(
      (day) => day.amount
    ),
    1
  )

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (amount) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    }

    const symbol =
      symbols[currency] || '₹'

    return `${symbol}${Number(amount).toLocaleString(
      'en-IN'
    )}`
  }

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  // =========================
  // CURRENT MONTH NAME
  // =========================

  const currentMonthName =
    now.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    })

  // =========================
  // TRANSACTION ICONS
  // =========================

  const getIcon = (category) => {
    const icons = {
      Food: (
        <Utensils
          size={18}
          strokeWidth={1.8}
        />
      ),

      Income: (
        <TrendingUp
          size={18}
          strokeWidth={1.8}
        />
      ),

      Transport: (
        <Car
          size={18}
          strokeWidth={1.8}
        />
      ),

      Entertainment: (
        <Clapperboard
          size={18}
          strokeWidth={1.8}
        />
      ),

      Shopping: (
        <ShoppingBag
          size={18}
          strokeWidth={1.8}
        />
      ),

      Bills: (
        <Receipt
          size={18}
          strokeWidth={1.8}
        />
      ),

      Health: (
        <HeartPulse
          size={18}
          strokeWidth={1.8}
        />
      ),

      Education: (
        <GraduationCap
          size={18}
          strokeWidth={1.8}
        />
      ),

      Other: (
        <CreditCard
          size={18}
          strokeWidth={1.8}
        />
      ),
    }

    return (
      icons[category] || (
        <CreditCard
          size={18}
          strokeWidth={1.8}
        />
      )
    )
  }

  // =========================
  // RECENT TRANSACTIONS
  // =========================

  const recentTransactions =
    transactions.slice(0, 5)

  // =========================
  // DASHBOARD
  // =========================

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
            className="nav-item active"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>
              <LayoutDashboard
                size={17}
                strokeWidth={1.8}
              />
            </span>

            Overview
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/transactions')
            }
          >
            <span>
              <ArrowLeftRight
                size={17}
                strokeWidth={1.8}
              />
            </span>

            Transactions
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/budgets')
            }
          >
            <span>
              <WalletCards
                size={17}
                strokeWidth={1.8}
              />
            </span>

            Budgets
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/analytics')
            }
          >
            <span>
              <ChartNoAxesCombined
                size={17}
                strokeWidth={1.8}
              />
            </span>

            Analytics
          </button>

          <p className="nav-title second-title">
            OTHER
          </p>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/settings')
            }
          >
            <span>
              <Settings
                size={17}
                strokeWidth={1.8}
              />
            </span>

            Settings
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">
              {userName
                ? userName
                    .charAt(0)
                    .toUpperCase()
                : 'U'}
            </div>

            <div>

              <strong>
                {userName || 'User'}
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
            <LogOut
              size={15}
              strokeWidth={1.8}
            />

            Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="dashboard-greeting">
              Good evening 👋
            </p>

            <h1>
              Here's your financial overview.
            </h1>

          </div>

          <div className="header-actions">

            {/* PRIMARY ACTION */}

            <button
              className="add-dashboard-btn"
              onClick={() =>
                navigate('/transactions?add=true')
              }
            >
              <Plus
                size={16}
                strokeWidth={2}
              />

              Add Transaction
            </button>

            <button
              className="notification-btn"
              aria-label="Notifications"
            >
              <Bell
                size={18}
                strokeWidth={1.8}
              />
            </button>

            <div className="header-profile">

              <div className="user-avatar">
                {userName
                  ? userName
                      .charAt(0)
                      .toUpperCase()
                  : 'U'}
              </div>

              <div>

                <strong>
                  {userName || 'User'}
                </strong>

                <span>
                  My account
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* SUMMARY CARDS */}

        <section className="summary-grid">

          <div className="summary-card balance-card">

            <div className="summary-card-top">

              <span>
                Total Balance
              </span>

              <div className="summary-icon">

                <IndianRupee
                  size={19}
                  strokeWidth={1.8}
                />

              </div>

            </div>

            <h2>
              {loading
                ? 'Loading...'
                : formatMoney(balance)}
            </h2>

            <p className="summary-positive">

              {balance >= 0 ? '↑' : '↓'}{' '}

              {balance >= 0
                ? 'Positive balance'
                : 'Negative balance'}

            </p>

          </div>

          <div className="summary-card">

            <div className="summary-card-top">

              <span>
                Total Income
              </span>

              <div className="summary-icon income-icon">

                <TrendingUp
                  size={19}
                  strokeWidth={1.8}
                />

              </div>

            </div>

            <h2>
              {loading
                ? 'Loading...'
                : formatMoney(totalIncome)}
            </h2>

            <p className="summary-positive">
              Money received
            </p>

          </div>

          <div className="summary-card">

            <div className="summary-card-top">

              <span>
                Total Expenses
              </span>

              <div className="summary-icon expense-icon">

                <TrendingDown
                  size={19}
                  strokeWidth={1.8}
                />

              </div>

            </div>

            <h2>
              {loading
                ? 'Loading...'
                : formatMoney(totalExpenses)}
            </h2>

            <p className="summary-negative">
              Money spent
            </p>

          </div>

          <div className="summary-card">

            <div className="summary-card-top">

              <span>
                Savings
              </span>

              <div className="summary-icon savings-icon">

                <PiggyBank
                  size={19}
                  strokeWidth={1.8}
                />

              </div>

            </div>

            <h2>
              {loading
                ? 'Loading...'
                : `${savingsRate.toFixed(1)}%`}
            </h2>

            <p className="summary-positive">
              {formatMoney(balance)} saved
            </p>

          </div>

        </section>

        {/* ERROR */}

        {!loading && error && (

          <div className="no-transactions">

            <div>
              ⚠️
            </div>

            <h3>
              Unable to load dashboard data
            </h3>

            <p>
              {error}
            </p>

          </div>

        )}

        {/* MIDDLE SECTION */}

        <section className="dashboard-grid">

          {/* SPENDING OVERVIEW */}

          <div className="dashboard-panel spending-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Spending Overview
                </h3>

                <p>
                  Your spending activity this week
                </p>

              </div>

              <select defaultValue="This week">

                <option>
                  This week
                </option>

              </select>

            </div>

            <div className="chart-area">

              <div className="chart-y-axis">

                <span>
                  {formatMoney(
                    maxDailySpending
                  )}
                </span>

                <span>
                  {formatMoney(
                    maxDailySpending * 0.75
                  )}
                </span>

                <span>
                  {formatMoney(
                    maxDailySpending * 0.5
                  )}
                </span>

                <span>
                  {formatMoney(
                    maxDailySpending * 0.25
                  )}
                </span>

                <span>
                  {formatMoney(0)}
                </span>

              </div>

              <div className="bar-chart">

                {weeklySpending.map(
                  (day, index) => {

                    const barHeight =
                      day.amount > 0
                        ? Math.max(
                            (day.amount /
                              maxDailySpending) *
                              100,
                            5
                          )
                        : 0

                    return (

                      <div
                        className="bar-column"
                        key={index}
                      >

                        <div
                          className={
                            day.amount ===
                            maxDailySpending
                              ? 'bar active-bar'
                              : 'bar'
                          }
                          style={{
                            height: `${barHeight}%`,
                          }}
                          title={`${day.day}: ${formatMoney(
                            day.amount
                          )}`}
                        ></div>

                        <span>
                          {day.day}
                        </span>

                      </div>

                    )
                  }
                )}

              </div>

            </div>

          </div>

          {/* MONTHLY BUDGET */}

          <div className="dashboard-panel budget-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Monthly Budget
                </h3>

                <p>
                  {currentMonthName} spending limit
                </p>

              </div>

              <span className="budget-percent">

                {monthlyBudget > 0
                  ? `${budgetPercentage.toFixed(
                      0
                    )}% used`
                  : 'No budget'}

              </span>

            </div>

            <div className="budget-amount">

              <strong>
                {formatMoney(monthlySpent)}
              </strong>

              <span>
                spent
              </span>

            </div>

            <div className="budget-progress">

              <div
                style={{
                  width:
                    monthlyBudget > 0
                      ? `${safeBudgetPercentage}%`
                      : '0%',
                }}
              ></div>

            </div>

            <p className="budget-left">

              {monthlyBudget > 0
                ? budgetRemaining >= 0
                  ? `${formatMoney(
                      budgetRemaining
                    )} remaining of ${formatMoney(
                      monthlyBudget
                    )}`
                  : `${formatMoney(
                      Math.abs(
                        budgetRemaining
                      )
                    )} over budget`
                : 'Set a monthly budget to start tracking your spending.'}

            </p>

            {monthlyBudget === 0 && !loading && (
              <button
                className="add-transaction-btn"
                onClick={() => navigate('/budgets')}
              >
                <Plus size={16} strokeWidth={2} />
                Create Budget
              </button>
            )}

            <div className="budget-categories">

              <div>

                <span>

                  <i className="category-dot food-dot"></i>

                  Food

                </span>

                <strong>

                  {formatMoney(
                    transactions
                      .filter(
                        (t) =>
                          t.category ===
                            'Food' &&
                          t.type?.toLowerCase() ===
                            'expense' &&
                          new Date(t.date) >=
                            monthStart &&
                          new Date(t.date) <
                            nextMonthStart
                      )
                      .reduce(
                        (sum, t) =>
                          sum +
                          Number(t.amount),
                        0
                      )
                  )}

                </strong>

              </div>

              <div>

                <span>

                  <i className="category-dot transport-dot"></i>

                  Transport

                </span>

                <strong>

                  {formatMoney(
                    transactions
                      .filter(
                        (t) =>
                          t.category ===
                            'Transport' &&
                          t.type?.toLowerCase() ===
                            'expense' &&
                          new Date(t.date) >=
                            monthStart &&
                          new Date(t.date) <
                            nextMonthStart
                      )
                      .reduce(
                        (sum, t) =>
                          sum +
                          Number(t.amount),
                        0
                      )
                  )}

                </strong>

              </div>

              <div>

                <span>

                  <i className="category-dot shopping-dot"></i>

                  Shopping

                </span>

                <strong>

                  {formatMoney(
                    transactions
                      .filter(
                        (t) =>
                          t.category ===
                            'Shopping' &&
                          t.type?.toLowerCase() ===
                            'expense' &&
                          new Date(t.date) >=
                            monthStart &&
                          new Date(t.date) <
                            nextMonthStart
                      )
                      .reduce(
                        (sum, t) =>
                          sum +
                          Number(t.amount),
                        0
                      )
                  )}

                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* RECENT TRANSACTIONS */}

        <section className="dashboard-panel transactions-panel">

          <div className="panel-header">

            <div>

              <h3>
                Recent Transactions
              </h3>

              <p>
                Your latest financial activity
              </p>

            </div>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate('/transactions')
              }
            >
              View all

              <ArrowRight
                size={14}
                strokeWidth={1.8}
              />

            </button>

          </div>

          <div className="transaction-list">

            {loading && (

              <div className="no-transactions">

                <div>

                  <Clock3
                    size={24}
                    strokeWidth={1.8}
                  />

                </div>

                <h3>
                  Loading transactions...
                </h3>

              </div>

            )}

            {!loading &&
              !error &&
              recentTransactions.length ===
                0 && (

                <div className="no-transactions">

                  <div>

                    <CreditCard
                      size={24}
                      strokeWidth={1.8}
                    />

                  </div>

                  <h3>
                    No transactions yet
                  </h3>

                  <p>
                    Add your first transaction
                    to see it here.
                  </p>

                </div>

              )}

            {!loading &&
              !error &&
              recentTransactions.map(
                (transaction) => {

                  const isIncome =
                    transaction.type?.toLowerCase() ===
                    'income'

                  return (

                    <div
                      className="transaction-row"
                      key={transaction.id}
                    >

                      <div className="transaction-info">

                        <div className="transaction-icon">

                          {getIcon(
                            transaction.category
                          )}

                        </div>

                        <div>

                          <strong>
                            {transaction.name}
                          </strong>

                          <span>
                            {transaction.category}
                            {' · '}
                            {formatDate(
                              transaction.date
                            )}
                          </span>

                        </div>

                      </div>

                      <strong
                        className={
                          isIncome
                            ? 'transaction-income'
                            : 'transaction-expense'
                        }
                      >

                        {isIncome
                          ? '+'
                          : '-'}

                        {formatMoney(
                          transaction.amount
                        )}

                      </strong>

                    </div>

                  )
                }
              )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default Dashboard