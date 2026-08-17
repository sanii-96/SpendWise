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
  AlertCircle,
  CheckCircle2,
  TriangleAlert,
  OctagonAlert,
} from 'lucide-react'

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
  })

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
      alert('You must be logged in.')
      setLoading(false)
      return
    }

    const { data: budgetData, error: budgetError } =
      await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })

    if (budgetError) {
      console.error(budgetError)
      alert(budgetError.message)
      setLoading(false)
      return
    }

    const { data: transactionData, error: transactionError } =
      await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

    if (transactionError) {
      console.error(transactionError)
      alert(transactionError.message)
      setLoading(false)
      return
    }

    setBudgets(budgetData || [])
    setTransactions(transactionData || [])

    setLoading(false)
  }

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target

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
      month: new Date().toISOString().slice(0, 7),
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
      month: new Date().toISOString().slice(0, 7),
    })
  }

  // =========================
  // SAVE BUDGET
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid budget amount.')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in.')
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
      const { data, error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', editingId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error(error)
        alert(error.message)
        setSaving(false)
        return
      }

      setBudgets((current) =>
        current.map((budget) =>
          budget.id === editingId ? data : budget
        )
      )

      closeForm()
      setSaving(false)
      return
    }

    // INSERT
    const { data, error } = await supabase
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
      alert(error.message)
      setSaving(false)
      return
    }

    setBudgets((current) => [data, ...current])

    closeForm()
    setSaving(false)
  }

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this budget?'
    )

    if (!confirmed) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in.')
      return
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      alert(error.message)
      return
    }

    setBudgets((current) =>
      current.filter((budget) => budget.id !== id)
    )
  }

  // =========================
  // CALCULATE SPENDING
  // =========================

  const getSpent = (budget) => {
    const budgetMonth = budget.month.slice(0, 7)

    return transactions
      .filter((transaction) => {
        const transactionMonth =
          transaction.date?.slice(0, 7)

        return (
          transaction.category === budget.category &&
          transaction.type?.toLowerCase() === 'expense' &&
          transactionMonth === budgetMonth
        )
      })
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      )
  }

  // =========================
  // HELPERS
  // =========================

  const formatMoney = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`
  }

  const formatMonth = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    })
  }

  const getPercentage = (spent, budget) => {
    if (budget <= 0) return 0

    return Math.min((spent / budget) * 100, 100)
  }

  const getStatus = (spent, budget) => {
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
      Food: <Utensils size={18} strokeWidth={1.8} />,
      Transport: <Car size={18} strokeWidth={1.8} />,
      Shopping: <ShoppingBag size={18} strokeWidth={1.8} />,
      Entertainment: <Clapperboard size={18} strokeWidth={1.8} />,
      Bills: <Receipt size={18} strokeWidth={1.8} />,
      Health: <HeartPulse size={18} strokeWidth={1.8} />,
      Education: <GraduationCap size={18} strokeWidth={1.8} />,
      Other: <CreditCard size={18} strokeWidth={1.8} />,
    }

    return (
      icons[category] || (
        <CreditCard size={18} strokeWidth={1.8} />
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
              <X size={18} strokeWidth={1.9} />
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
              <Clock3 size={25} strokeWidth={1.8} />
            </div>

            <h3>
              Loading budgets...
            </h3>

          </div>

        )}


        {!loading && budgets.length === 0 && (

          <div className="no-transactions">

            <div>
              <WalletCards size={25} strokeWidth={1.8} />
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
              <Plus size={16} strokeWidth={2} />
              Create Your First Budget
            </button>

          </div>

        )}


        {!loading &&
          budgets.map((budget) => {

            const spent = getSpent(budget)

            const remaining =
              Number(budget.amount) - spent

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
                        openEditForm(budget)
                      }
                    >
                      <Pencil size={15} strokeWidth={1.9} />
                    </button>

                    <button
                      title="Delete budget"
                      aria-label="Delete budget"
                      onClick={() =>
                        handleDelete(
                          budget.id
                        )
                      }
                    >
                      <Trash2 size={15} strokeWidth={1.9} />
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
                      {formatMoney(spent)}
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
                        Math.abs(remaining)
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
                      <CheckCircle2 size={15} strokeWidth={1.9} />
                      You're within your budget.
                    </>
                  )}

                  {status === 'warning' && (
                    <>
                      <TriangleAlert size={15} strokeWidth={1.9} />
                      You've used 80% or more of your budget.
                    </>
                  )}

                  {status === 'exceeded' && (
                    <>
                      <OctagonAlert size={15} strokeWidth={1.9} />
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