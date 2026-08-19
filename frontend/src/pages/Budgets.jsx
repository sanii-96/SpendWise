import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

import {
  Utensils,
  Car,
  ShoppingBag,
  Clapperboard,
  Receipt,
  HeartPulse,
  GraduationCap,
  CreditCard,
  Plus,
  X,
  Pencil,
  Trash2,
  Clock3,
  WalletCards,
  CheckCircle2,
  TriangleAlert,
  OctagonAlert,
} from 'lucide-react'

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
  })

  const [deleteTarget, setDeleteTarget] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
  })

  // =========================
  // SEND BUDGET EMAIL
  // =========================

  const sendBudgetAlert = async ({
    category,
    budgetAmount,
    spent,
    percentage,
    status,
    month,
  }) => {
    try {
      const subject =
        status === 'exceeded'
          ? `🚨 SpendWise: ${category} budget exceeded`
          : `⚠️ SpendWise: ${category} budget warning`

      const remaining = Number(budgetAmount) - Number(spent)

      const html = `
        <div
          style="
            font-family: Arial, sans-serif;
            background: #f4f7fb;
            padding: 30px;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 14px;
              padding: 30px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            "
          >
            <h2
              style="
                margin-top: 0;
                color: #172033;
              "
            >
              ${
                status === 'exceeded'
                  ? '🚨 Budget Exceeded'
                  : '⚠️ Budget Warning'
              }
            </h2>

            <p
              style="
                color: #526079;
                font-size: 15px;
                line-height: 1.6;
              "
            >
              ${
                status === 'exceeded'
                  ? `You've exceeded your ${category} budget.`
                  : `You've used 80% or more of your ${category} budget.`
              }
            </p>

            <div
              style="
                background: #f7f9fc;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
              "
            >
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Month:</strong> ${month}</p>
              <p><strong>Budget:</strong> ₹${Number(budgetAmount).toLocaleString('en-IN')}</p>
              <p><strong>Spent:</strong> ₹${Number(spent).toLocaleString('en-IN')}</p>
              <p><strong>Used:</strong> ${Number(percentage).toFixed(0)}%</p>
              <p>
                <strong>Remaining:</strong>
                ₹${Math.abs(remaining).toLocaleString('en-IN')}
              </p>
            </div>

            <p
              style="
                color: #526079;
                font-size: 14px;
              "
            >
              Open SpendWise to review your transactions and manage your budget.
            </p>

            <p
              style="
                color: #8a94a6;
                font-size: 12px;
                margin-top: 25px;
              "
            >
              This is an automated notification from SpendWise.
            </p>
          </div>
        </div>
      `

      const { error } =
        await supabase.functions.invoke(
          'send-budget-alert',
          {
            body: {
              subject,
              html,
            },
          }
        )

      if (error) {
        console.error(
          'Budget email error:',
          error
        )

        return false
      }

      return true
    } catch (error) {
      console.error(
        'Unable to send budget email:',
        error
      )

      return false
    }
  }

  // =========================
  // CHECK BUDGET ALERTS
  // =========================

  const checkBudgetAlerts = async (
    budgetList,
    transactionList
  ) => {
    for (const budget of budgetList) {
      const budgetMonth =
        budget.month.slice(0, 7)

      const spent = transactionList
        .filter((transaction) => {
          const transactionMonth =
            transaction.date?.slice(0, 7)

          return (
            transaction.category ===
              budget.category &&
            transaction.type?.toLowerCase() ===
              'expense' &&
            transactionMonth === budgetMonth
          )
        })
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        )

      const budgetAmount =
        Number(budget.amount)

      if (budgetAmount <= 0) continue

      const percentage =
        (spent / budgetAmount) * 100

      let currentStatus = 'safe'

      if (spent >= budgetAmount) {
        currentStatus = 'exceeded'
      } else if (
        spent >= budgetAmount * 0.8
      ) {
        currentStatus = 'warning'
      }

      const alertKey =
        `spendwise-budget-${budget.id}`

      const previousStatus =
        localStorage.getItem(alertKey)

      // First time checking this budget
      if (!previousStatus) {
        if (
          currentStatus === 'warning' ||
          currentStatus === 'exceeded'
        ) {
          const sent =
            await sendBudgetAlert({
              category: budget.category,
              budgetAmount,
              spent,
              percentage,
              status: currentStatus,
              month: formatMonth(
                budget.month
              ),
            })

          if (sent) {
            localStorage.setItem(
              alertKey,
              currentStatus
            )
          }
        } else {
          localStorage.setItem(
            alertKey,
            'safe'
          )
        }

        continue
      }

      // Budget went back below 80%
      if (currentStatus === 'safe') {
        if (previousStatus !== 'safe') {
          localStorage.setItem(
            alertKey,
            'safe'
          )
        }

        continue
      }

      // Safe -> Warning
      if (
        currentStatus === 'warning' &&
        previousStatus === 'safe'
      ) {
        const sent =
          await sendBudgetAlert({
            category: budget.category,
            budgetAmount,
            spent,
            percentage,
            status: 'warning',
            month: formatMonth(
              budget.month
            ),
          })

        if (sent) {
          localStorage.setItem(
            alertKey,
            'warning'
          )
        }

        continue
      }

      // Warning -> Exceeded
      if (
        currentStatus === 'exceeded' &&
        previousStatus !== 'exceeded'
      ) {
        const sent =
          await sendBudgetAlert({
            category: budget.category,
            budgetAmount,
            spent,
            percentage,
            status: 'exceeded',
            month: formatMonth(
              budget.month
            ),
          })

        if (sent) {
          localStorage.setItem(
            alertKey,
            'exceeded'
          )
        }
      }
    }
  }

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFeedback({
        type: 'error',
        message:
          'Your session has expired. Please log in again.',
      })

      setLoading(false)
      return
    }

    const {
      data: budgetData,
      error: budgetError,
    } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('month', {
        ascending: false,
      })

    if (budgetError) {
      console.error(budgetError)

      setFeedback({
        type: 'error',
        message:
          budgetError.message ||
          'Unable to load budgets.',
      })

      setLoading(false)
      return
    }

    const {
      data: transactionData,
      error: transactionError,
    } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)

    if (transactionError) {
      console.error(transactionError)

      setFeedback({
        type: 'error',
        message:
          transactionError.message ||
          'Unable to load transactions.',
      })

      setLoading(false)
      return
    }

    const finalBudgets =
      budgetData || []

    const finalTransactions =
      transactionData || []

    setBudgets(finalBudgets)
    setTransactions(finalTransactions)

    // Check whether any budget has crossed
    // an alert threshold.
    await checkBudgetAlerts(
      finalBudgets,
      finalTransactions
    )

    setLoading(false)
  }

  // =========================
  // AUTO-DISMISS FEEDBACK
  // =========================

  useEffect(() => {
    if (!feedback.message) return

    const timer = setTimeout(() => {
      setFeedback({
        type: '',
        message: '',
      })
    }, 3500)

    return () =>
      clearTimeout(timer)
  }, [feedback.message])

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const openAddForm = () => {
    setEditingId(null)

    setFormData({
      category: 'Food',
      amount: '',
      month: new Date()
        .toISOString()
        .slice(0, 7),
    })

    setShowForm(true)
  }

  const openEditForm = (budget) => {
    setEditingId(budget.id)

    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month.slice(0, 7),
    })

    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)

    setFormData({
      category: 'Food',
      amount: '',
      month: new Date()
        .toISOString()
        .slice(0, 7),
    })
  }

  // =========================
  // SAVE BUDGET
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setFeedback({
        type: 'error',
        message:
          'Please enter a valid budget amount.',
      })

      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFeedback({
        type: 'error',
        message:
          'Your session has expired. Please log in again.',
      })

      setSaving(false)
      return
    }

    const budgetData = {
      category: formData.category,
      amount: Number(formData.amount),
      month: `${formData.month}-01`,
    }

    // UPDATE
    if (editingId) {
      const {
        data,
        error,
      } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', editingId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error(error)

        setFeedback({
          type: 'error',
          message:
            error.message ||
            'Something went wrong. Please try again.',
        })

        setSaving(false)
        return
      }

      setBudgets((current) =>
        current.map((budget) =>
          budget.id === editingId
            ? data
            : budget
        )
      )

      // Reset alert state when budget is edited
      // so the new threshold can be evaluated.
      localStorage.removeItem(
        `spendwise-budget-${editingId}`
      )

      closeForm()
      setSaving(false)

      setFeedback({
        type: 'success',
        message:
          'Budget updated successfully.',
      })

      // Refresh data so the edited budget
      // is immediately evaluated.
      await fetchData()

      return
    }

    // INSERT
    const {
      data,
      error,
    } = await supabase
      .from('budgets')
      .insert([
        {
          user_id: user.id,
          ...budgetData,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(error)

      setFeedback({
        type: 'error',
        message:
          error.message ||
          'Something went wrong. Please try again.',
      })

      setSaving(false)
      return
    }

    setBudgets((current) => [
      data,
      ...current,
    ])

    closeForm()
    setSaving(false)

    setFeedback({
      type: 'success',
      message:
        'Budget created successfully.',
    })
  }

  // =========================
  // DELETE
  // =========================

  const requestDelete = (budget) => {
    setDeleteTarget(budget)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setDeleteTarget(null)

      setFeedback({
        type: 'error',
        message:
          'Your session has expired. Please log in again.',
      })

      return
    }

    const { error } =
      await supabase
        .from('budgets')
        .delete()
        .eq('id', deleteTarget.id)
        .eq('user_id', user.id)

    if (error) {
      setDeleteTarget(null)

      setFeedback({
        type: 'error',
        message:
          error.message ||
          'Unable to delete the budget.',
      })

      return
    }

    localStorage.removeItem(
      `spendwise-budget-${deleteTarget.id}`
    )

    setBudgets((current) =>
      current.filter(
        (budget) =>
          budget.id !== deleteTarget.id
      )
    )

    setDeleteTarget(null)

    setFeedback({
      type: 'success',
      message:
        'Budget deleted successfully.',
    })
  }

  // =========================
  // CALCULATE SPENDING
  // =========================

  const getSpent = (budget) => {
    const budgetMonth =
      budget.month.slice(0, 7)

    return transactions
      .filter((transaction) => {
        const transactionMonth =
          transaction.date?.slice(0, 7)

        return (
          transaction.category ===
            budget.category &&
          transaction.type?.toLowerCase() ===
            'expense' &&
          transactionMonth ===
            budgetMonth
        )
      })
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      )
  }

  // =========================
  // HELPERS
  // =========================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount
    ).toLocaleString('en-IN')}`
  }

  const formatMonth = (date) => {
    return new Date(
      date
    ).toLocaleDateString(
      'en-IN',
      {
        month: 'long',
        year: 'numeric',
      }
    )
  }

  const getPercentage = (
    spent,
    budget
  ) => {
    if (budget <= 0) return 0

    return Math.min(
      (spent / budget) * 100,
      100
    )
  }

  const getStatus = (
    spent,
    budget
  ) => {
    if (spent >= budget) {
      return 'exceeded'
    }

    if (spent >= budget * 0.8) {
      return 'warning'
    }

    return 'safe'
  }

  const getIcon = (category) => {
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

  return (
    <div className="transactions-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-heading">

        <div>

          <p className="page-eyebrow">
            FINANCIAL PLANNING
          </p>

          <h1>
            Budgets
          </h1>

          <p>
            Set spending limits and stay in control of your money.
          </p>

        </div>

        <button
          className="add-transaction-btn"
          onClick={openAddForm}
        >
          + Add Budget
        </button>

      </div>

      {/* =========================
          IN-APP FEEDBACK
      ========================= */}

      {feedback.message && (
        <div
          className={`form-message ${
            feedback.type === 'success'
              ? 'success-message'
              : 'error-message'
          }`}
          role="status"
        >

          <span>
            {feedback.type === 'success'
              ? '✓'
              : '⚠'}
          </span>

          <span>
            {feedback.message}
          </span>

          <button
            type="button"
            onClick={() =>
              setFeedback({
                type: '',
                message: '',
              })
            }
            aria-label="Dismiss message"
          >
            <X
              size={15}
              strokeWidth={1.8}
            />
          </button>

        </div>
      )}

      {/* =========================
          FORM
      ========================= */}

      {showForm && (

        <div className="add-transaction-form">

          <div className="form-header">

            <div>

              <h2>
                {editingId
                  ? 'Edit Budget'
                  : 'Create Budget'}
              </h2>

              <p>
                Set a monthly spending limit.
              </p>

            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close budget form"
              title="Close"
            >
              <X
                size={18}
                strokeWidth={1.9}
              />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >

                <option value="Food">
                  Food
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Health">
                  Health
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>
                  Monthly limit
                </label>

                <input
                  type="number"
                  name="amount"
                  placeholder="5000"
                  min="1"
                  value={formData.amount}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Month
                </label>

                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-transaction-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Create Budget'}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =========================
          DELETE CONFIRMATION
      ========================= */}

      {deleteTarget && (
        <div
          className="delete-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-delete-dialog-title"
        >

          <div className="delete-modal">

            <div className="delete-modal-icon">
              <Trash2
                size={20}
                strokeWidth={1.9}
              />
            </div>

            <h2 id="budget-delete-dialog-title">
              Delete budget?
            </h2>

            <p>
              Are you sure you want to delete the{' '}
              <strong>
                {deleteTarget.category}
              </strong>{' '}
              budget for{' '}
              {formatMoney(
                deleteTarget.amount
              )}
              ? This action cannot be undone.
            </p>

            <div className="delete-modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDelete}
              >
                <Trash2
                  size={15}
                  strokeWidth={1.9}
                />
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          BUDGET LIST
      ========================= */}

      <div className="transactions-container">

        <div className="transaction-toolbar">

          <div>

            <h2>
              Your Budgets
            </h2>

            <p>
              Monitor your spending limits.
            </p>

          </div>

        </div>

        {loading && (

          <div className="no-transactions">

            <div>
              <Clock3
                size={25}
                strokeWidth={1.8}
              />
            </div>

            <h3>
              Loading budgets...
            </h3>

          </div>

        )}

        {!loading &&
          budgets.length === 0 && (

            <div className="no-transactions">

              <div>
                <WalletCards
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <h3>
                No budgets yet
              </h3>

              <p>
                Create your first budget to start tracking your spending.
              </p>

              <button
                className="add-transaction-btn"
                onClick={openAddForm}
              >
                <Plus
                  size={16}
                  strokeWidth={2}
                />
                Create Your First Budget
              </button>

            </div>

          )}

        {!loading &&
          budgets.map((budget) => {

            const spent =
              getSpent(budget)

            const remaining =
              Number(budget.amount) -
              spent

            const percentage =
              getPercentage(
                spent,
                Number(budget.amount)
              )

            const status =
              getStatus(
                spent,
                Number(budget.amount)
              )

            return (

              <div
                key={budget.id}
                className="budget-card"
              >

                {/* TOP */}

                <div className="budget-card-top">

                  <div className="budget-category">

                    <div className="budget-icon">
                      {getIcon(
                        budget.category
                      )}
                    </div>

                    <div>

                      <h3>
                        {budget.category}
                      </h3>

                      <span>
                        {formatMonth(
                          budget.month
                        )}
                      </span>

                    </div>

                  </div>

                  <div className="budget-actions">

                    <button
                      title="Edit budget"
                      aria-label="Edit budget"
                      onClick={() =>
                        openEditForm(
                          budget
                        )
                      }
                    >
                      <Pencil
                        size={15}
                        strokeWidth={1.9}
                      />
                    </button>

                    <button
                      title="Delete budget"
                      aria-label="Delete budget"
                      onClick={() =>
                        requestDelete(
                          budget
                        )
                      }
                    >
                      <Trash2
                        size={15}
                        strokeWidth={1.9}
                      />
                    </button>

                  </div>

                </div>

                {/* AMOUNT */}

                <div className="budget-numbers">

                  <div>

                    <span>
                      Spent
                    </span>

                    <strong>
                      {formatMoney(
                        spent
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Limit
                    </span>

                    <strong>
                      {formatMoney(
                        budget.amount
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Remaining
                    </span>

                    <strong
                      className={
                        remaining < 0
                          ? 'expense-text'
                          : 'income-text'
                      }
                    >
                      {formatMoney(
                        Math.abs(
                          remaining
                        )
                      )}
                    </strong>

                  </div>

                </div>

                {/* PROGRESS */}

                <div className="budget-progress-wrapper">

                  <div className="budget-progress">

                    <div
                      style={{
                        width: `${percentage}%`,
                      }}
                      className={`budget-progress-fill ${status}`}
                    ></div>

                  </div>

                  <strong>
                    {percentage.toFixed(0)}%
                  </strong>

                </div>

                {/* STATUS */}

                <div
                  className={`budget-status ${status}`}
                >

                  {status === 'safe' && (
                    <>
                      <CheckCircle2
                        size={15}
                        strokeWidth={1.9}
                      />
                      You're within your budget.
                    </>
                  )}

                  {status === 'warning' && (
                    <>
                      <TriangleAlert
                        size={15}
                        strokeWidth={1.9}
                      />
                      You've used 80% or more of your budget.
                    </>
                  )}

                  {status === 'exceeded' && (
                    <>
                      <OctagonAlert
                        size={15}
                        strokeWidth={1.9}
                      />
                      You've exceeded this budget.
                    </>
                  )}

                </div>

              </div>

            )
          })}

      </div>

    </div>
  )
}

export default Budgets