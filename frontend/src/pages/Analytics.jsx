import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

import {
  ChartNoAxesCombined,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Utensils,
  Car,
  ShoppingBag,
  Clapperboard,
  Receipt,
  HeartPulse,
  GraduationCap,
  CreditCard,
  Clock3,
  BarChart3,
} from 'lucide-react'

function Analytics() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  // =========================
  // FETCH TRANSACTIONS
  // =========================

  const fetchTransactions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setTransactions(data || [])
    setLoading(false)
  }

  // =========================
  // TOTAL INCOME
  // =========================

  const income = transactions
    .filter(
      (t) =>
        t.type?.toLowerCase() === 'income'
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0
    )

  // =========================
  // TOTAL EXPENSES
  // =========================

  const expenses = transactions
    .filter(
      (t) =>
        t.type?.toLowerCase() === 'expense'
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0
    )

  // =========================
  // SAVINGS
  // =========================

  const savings = income - expenses

  // =========================
  // SAVINGS RATE
  // =========================

  const savingsRate =
    income > 0
      ? (savings / income) * 100
      : 0

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Entertainment',
    'Bills',
    'Health',
    'Education',
    'Other',
  ]

  // =========================
  // CATEGORY ICON
  // =========================

  const getCategoryIcon = (category) => {
    const icons = {
      Food: (
        <Utensils
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

      Shopping: (
        <ShoppingBag
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
  // CATEGORY TOTALS
  // =========================

  const categoryTotals = categories.map(
    (category) => ({
      category,

      amount: transactions
        .filter(
          (t) =>
            t.category === category &&
            t.type?.toLowerCase() ===
              'expense'
        )
        .reduce(
          (sum, t) =>
            sum + Number(t.amount),
          0
        ),
    })
  )

  // =========================
  // MAX CATEGORY
  // =========================

  const maxCategory = Math.max(
    ...categoryTotals.map(
      (item) => item.amount
    ),
    1
  )

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (amount) => {
    return `₹${Number(amount).toLocaleString(
      'en-IN'
    )}`
  }

  // =========================
  // CATEGORY COLOR CLASS
  // =========================

  const getCategoryClass = (category) => {
    const classes = {
      Food: 'analytics-food',
      Transport: 'analytics-transport',
      Shopping: 'analytics-shopping',
      Entertainment:
        'analytics-entertainment',
      Bills: 'analytics-bills',
      Health: 'analytics-health',
      Education:
        'analytics-education',
      Other: 'analytics-other',
    }

    return (
      classes[category] ||
      'analytics-other'
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="transactions-page analytics-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">

        <div>

          <p className="page-eyebrow">
            FINANCIAL INSIGHTS
          </p>

          <h1>
            Analytics
          </h1>

          <p>
            Understand where your money goes.
          </p>

        </div>

        <button
          className="add-transaction-btn analytics-view-btn"
          onClick={() =>
            navigate('/transactions')
          }
        >
          View Transactions

          <ArrowRight
            size={16}
            strokeWidth={1.9}
          />
        </button>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (

        <div className="no-transactions analytics-loading">

          <div>
            <Clock3
              size={26}
              strokeWidth={1.8}
            />
          </div>

          <h3>
            Loading analytics...
          </h3>

          <p>
            Preparing your financial insights.
          </p>

        </div>

      ) : (

        <>

          {/* =========================
              SUMMARY CARDS
          ========================= */}

          <div className="transaction-summary analytics-summary">

            {/* TOTAL INCOME */}

            <div className="analytics-summary-card">

              <div className="analytics-card-heading">

                <span>
                  Total Income
                </span>

                <div className="analytics-icon income-analytics-icon">
                  <TrendingUp
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

              </div>

              <strong className="income-text">
                {formatMoney(income)}
              </strong>

              <small>
                Money received
              </small>

            </div>


            {/* TOTAL EXPENSES */}

            <div className="analytics-summary-card">

              <div className="analytics-card-heading">

                <span>
                  Total Expenses
                </span>

                <div className="analytics-icon expense-analytics-icon">
                  <TrendingDown
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

              </div>

              <strong className="expense-text">
                {formatMoney(expenses)}
              </strong>

              <small>
                Money spent
              </small>

            </div>


            {/* SAVINGS */}

            <div className="analytics-summary-card">

              <div className="analytics-card-heading">

                <span>
                  Savings
                </span>

                <div className="analytics-icon savings-analytics-icon">
                  <PiggyBank
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

              </div>

              <strong>
                {formatMoney(savings)}
              </strong>

              <small>
                Income minus expenses
              </small>

            </div>


            {/* SAVINGS RATE */}

            <div className="analytics-summary-card">

              <div className="analytics-card-heading">

                <span>
                  Savings Rate
                </span>

                <div className="analytics-icon rate-analytics-icon">
                  <Percent
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

              </div>

              <strong>
                {savingsRate.toFixed(1)}%
              </strong>

              <small>
                Of total income
              </small>

            </div>

          </div>


          {/* =========================
              SPENDING BY CATEGORY
          ========================= */}

          <div className="transactions-container analytics-container">

            <div className="transaction-toolbar analytics-toolbar">

              <div>

                <div className="analytics-title-row">

                  <div className="analytics-title-icon">

                    <ChartNoAxesCombined
                      size={19}
                      strokeWidth={1.8}
                    />

                  </div>

                  <div>

                    <h2>
                      Spending by Category
                    </h2>

                    <p>
                      See which categories use the most money.
                    </p>

                  </div>

                </div>

              </div>

              <div className="analytics-total">

                <span>
                  TOTAL SPENT
                </span>

                <strong>
                  {formatMoney(expenses)}
                </strong>

              </div>

            </div>


            {/* =========================
                CATEGORY LIST
            ========================= */}

            <div className="analytics-category-list">

              {categoryTotals
                .filter(
                  (item) =>
                    item.amount > 0
                )
                .sort(
                  (a, b) =>
                    b.amount - a.amount
                )
                .map((item) => {

                  const percentage =
                    (item.amount /
                      maxCategory) *
                    100

                  const share =
                    expenses > 0
                      ? (item.amount /
                          expenses) *
                        100
                      : 0

                  return (

                    <div
                      key={item.category}
                      className="analytics-category"
                    >

                      {/* CATEGORY INFO */}

                      <div className="analytics-category-top">

                        <div className="analytics-category-info">

                          <div
                            className={`analytics-category-icon ${getCategoryClass(
                              item.category
                            )}`}
                          >
                            {getCategoryIcon(
                              item.category
                            )}
                          </div>

                          <div>

                            <strong>
                              {item.category}
                            </strong>

                            <span>
                              {share.toFixed(1)}%
                              {' '}of total spending
                            </span>

                          </div>

                        </div>

                        <strong className="analytics-category-amount">
                          {formatMoney(
                            item.amount
                          )}
                        </strong>

                      </div>


                      {/* PROGRESS */}

                      <div className="analytics-bar-track">

                        <div
                          className={`analytics-bar-fill ${getCategoryClass(
                            item.category
                          )}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                })}


              {/* =========================
                  EMPTY STATE
              ========================= */}

              {expenses === 0 && (

                <div className="no-transactions analytics-empty">

                  <div>

                    <BarChart3
                      size={28}
                      strokeWidth={1.8}
                    />

                  </div>

                  <h3>
                    No expense data yet
                  </h3>

                  <p>
                    Add some expenses to see your analytics.
                  </p>

                  <button
                    className="add-transaction-btn"
                    onClick={() =>
                      navigate('/transactions')
                    }
                  >
                    Add Transaction

                    <ArrowRight
                      size={15}
                      strokeWidth={1.9}
                    />

                  </button>

                </div>

              )}

            </div>

          </div>

        </>

      )}

    </div>
  )
}

export default Analytics