import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

import {
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  Clock3,
  AlertCircle,
  FileSearch,
  Utensils,
  Car,
  ShoppingBag,
  Clapperboard,
  Receipt,
  HeartPulse,
  GraduationCap,
  CreditCard,
  TrendingUp,
} from 'lucide-react'

function Transactions() {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
  })

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    type: 'Expense',
    date: new Date()
      .toISOString()
      .split('T')[0],
  })

  // =========================
  // FETCH TRANSACTIONS
  // =========================

  useEffect(() => {
    fetchTransactions()
  }, [])

  // =========================
  // OPEN FORM FROM DASHBOARD
  // =========================

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingId(null)

      setFormData({
        name: '',
        amount: '',
        category: 'Food',
        type: 'Expense',
        date: new Date()
          .toISOString()
          .split('T')[0],
      })

      setShowForm(true)

      // Remove ?add=true from the URL
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(
        'You must be logged in to view transactions.'
      )

      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error(
        'Error fetching transactions:',
        error
      )

      setError(error.message)
      setLoading(false)
      return
    }

    setTransactions(data || [])
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

    return () => clearTimeout(timer)
  }, [feedback.message])

  // =========================
  // FORM CHANGE
  // =========================

  const handleFormChange = (e) => {
    const { name, value } = e.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: 'Food',
      type: 'Expense',
      date: new Date()
        .toISOString()
        .split('T')[0],
    })

    setEditingId(null)
    setShowForm(false)
  }

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingId(null)

    setFormData({
      name: '',
      amount: '',
      category: 'Food',
      type: 'Expense',
      date: new Date()
        .toISOString()
        .split('T')[0],
    })

    setShowForm(true)
  }

  // =========================
  // ADD TRANSACTION
  // =========================

  const handleAddTransaction = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a transaction name.' })
      return
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setFeedback({ type: 'error', message: 'Please enter a valid amount.' })
      return
    }

    if (!formData.date) {
      setFeedback({ type: 'error', message: 'Please select a date.' })
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFeedback({ type: 'error', message: 'Your session has expired. Please log in again.' })
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          name: formData.name.trim(),
          amount: Number(formData.amount),
          category: formData.category,
          type: formData.type,
          date: formData.date,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(
        'Error adding transaction:',
        error
      )

      setFeedback({ type: 'error', message: error.message || 'Something went wrong. Please try again.' })
      setSaving(false)
      return
    }

    setTransactions((current) => [
      data,
      ...current,
    ])

    resetForm()
    setSaving(false)

    setFeedback({
      type: 'success',
      message: 'Transaction added successfully.',
    })
  }

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id)

    setFormData({
      name: transaction.name || '',
      amount: transaction.amount || '',
      category:
        transaction.category || 'Food',
      type:
        transaction.type?.toLowerCase() ===
        'income'
          ? 'Income'
          : 'Expense',
      date: transaction.date || '',
    })

    setShowForm(true)
  }

  // =========================
  // UPDATE TRANSACTION
  // =========================

  const handleUpdateTransaction = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a transaction name.' })
      return
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setFeedback({ type: 'error', message: 'Please enter a valid amount.' })
      return
    }

    if (!formData.date) {
      setFeedback({ type: 'error', message: 'Please select a date.' })
      return
    }

    if (!editingId) {
      setFeedback({
        type: 'error',
        message: 'No transaction selected for editing.',
      })
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFeedback({ type: 'error', message: 'Your session has expired. Please log in again.' })
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({
        name: formData.name.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        type: formData.type,
        date: formData.date,
      })
      .eq('id', editingId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error(
        'Error updating transaction:',
        error
      )

      setFeedback({ type: 'error', message: error.message || 'Something went wrong. Please try again.' })
      setSaving(false)
      return
    }

    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === editingId
          ? data
          : transaction
      )
    )

    resetForm()
    setSaving(false)

    setFeedback({
      type: 'success',
      message: 'Transaction updated successfully.',
    })
  }

  // =========================
  // DELETE TRANSACTION
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this transaction?'
    )

    if (!confirmed) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFeedback({ type: 'error', message: 'Your session has expired. Please log in again.' })
      return
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      setFeedback({ type: 'error', message: error.message || 'Something went wrong. Please try again.' })
      return
    }

    setTransactions((current) =>
      current.filter(
        (transaction) =>
          transaction.id !== id
      )
    )

    setFeedback({
      type: 'success',
      message: 'Transaction deleted successfully.',
    })
  }

  // =========================
  // FILTER + SEARCH
  // =========================

  const filteredTransactions =
    transactions.filter((transaction) => {
      const transactionType =
        transaction.type?.toLowerCase() ===
        'income'
          ? 'Income'
          : 'Expense'

      const matchesFilter =
        filter === 'All' ||
        transactionType === filter

      const matchesSearch =
        transaction.name
          ?.toLowerCase()
          .includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'All' ||
        transaction.category === categoryFilter

      const transactionDate = new Date(
        `${transaction.date}T00:00:00`
      )

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const daysFromMonday =
        day === 0 ? 6 : day - 1
      startOfWeek.setDate(
        startOfWeek.getDate() - daysFromMonday
      )

      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )

      let matchesDate = true

      if (dateFilter === 'Today') {
        matchesDate =
          transactionDate.getTime() ===
          today.getTime()
      } else if (dateFilter === 'This Week') {
        matchesDate =
          transactionDate >= startOfWeek &&
          transactionDate <= today
      } else if (dateFilter === 'This Month') {
        matchesDate =
          transactionDate >= startOfMonth &&
          transactionDate <= today
      }

      return (
        matchesFilter &&
        matchesSearch &&
        matchesCategory &&
        matchesDate
      )
    })

  // =========================
  // TOTALS
  // =========================

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type?.toLowerCase() ===
        'income'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  const totalExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type?.toLowerCase() ===
        'expense'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    )

  // =========================
  // DATE FORMAT
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
  // CATEGORY ICON
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

  return (
    <div className="transactions-page">

      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <div>

          <p className="page-eyebrow">
            FINANCIAL ACTIVITY
          </p>

          <h1>
            Transactions
          </h1>

          <p>
            Track and manage your income and expenses.
          </p>

        </div>

        <button
          className="add-transaction-btn"
          onClick={openAddForm}
        >
          <Plus
            size={16}
            strokeWidth={1.9}
          />

          Add Transaction
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
            {feedback.type === 'success' ? '✓' : '⚠'}
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
          ADD / EDIT FORM
      ========================= */}

      {showForm && (

        <div className="add-transaction-form">

          <div className="form-header">

            <div>

              <h2>
                {editingId !== null
                  ? 'Edit Transaction'
                  : 'Add Transaction'}
              </h2>

              <p>
                {editingId !== null
                  ? 'Update your transaction details.'
                  : 'Add a new income or expense.'}
              </p>

            </div>

            <button
              type="button"
              onClick={resetForm}
            >
              <X
                size={18}
                strokeWidth={1.9}
              />
            </button>

          </div>

          <form
            onSubmit={
              editingId !== null
                ? handleUpdateTransaction
                : handleAddTransaction
            }
          >

            {/* NAME */}

            <div className="form-group">

              <label>
                Transaction name
              </label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Swiggy"
                value={formData.name}
                onChange={handleFormChange}
              />

            </div>

            {/* AMOUNT + TYPE */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleFormChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                >

                  <option value="Expense">
                    Expense
                  </option>

                  <option value="Income">
                    Income
                  </option>

                </select>

              </div>

            </div>

            {/* CATEGORY + DATE */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
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

              <div className="form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                />

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
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
                  : editingId !== null
                    ? 'Save Changes'
                    : 'Save Transaction'}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="transaction-summary">

        <div>

          <span>
            Total transactions
          </span>

          <strong>
            {transactions.length}
          </strong>

        </div>

        <div>

          <span>
            Total income
          </span>

          <strong className="income-text">
            ₹
            {totalIncome.toLocaleString(
              'en-IN'
            )}
          </strong>

        </div>

        <div>

          <span>
            Total expenses
          </span>

          <strong className="expense-text">
            ₹
            {totalExpenses.toLocaleString(
              'en-IN'
            )}
          </strong>

        </div>

      </div>

      {/* =========================
          TRANSACTIONS CONTAINER
      ========================= */}

      <div className="transactions-container">

        {/* TOOLBAR */}

        <div className="transaction-toolbar">

          <div className="search-box">

            <span className="search-icon">

              <Search
                size={16}
                strokeWidth={1.9}
              />

            </span>

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="filter-buttons">

            {[
              'All',
              'Income',
              'Expense',
            ].map((item) => (

              <button
                key={item}
                className={
                  filter === item
                    ? 'filter-active'
                    : ''
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>

            ))}

          </div>


          <select
            className="transaction-category-filter"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>


          <select
            className="transaction-date-filter"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>

        </div>

        {/* TABLE */}

        <div className="transaction-table">

          <div className="table-header">

            <span>
              TRANSACTION
            </span>

            <span>
              CATEGORY
            </span>

            <span>
              DATE
            </span>

            <span>
              AMOUNT
            </span>

            <span></span>

          </div>

          {/* LOADING */}

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

              <p>
                Getting your financial activity.
              </p>

            </div>

          )}

          {/* ERROR */}

          {!loading && error && (

            <div className="no-transactions">

              <div>

                <AlertCircle
                  size={24}
                  strokeWidth={1.8}
                />

              </div>

              <h3>
                Unable to load transactions
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}

          {/* TRANSACTIONS */}

          {!loading &&
            !error &&
            filteredTransactions.map(
              (transaction) => {

                const isIncome =
                  transaction.type?.toLowerCase() ===
                  'income'

                return (

                  <div
                    className="table-row"
                    key={transaction.id}
                  >

                    {/* TRANSACTION */}

                    <div className="table-transaction">

                      <div className="table-icon">

                        {getIcon(
                          transaction.category
                        )}

                      </div>

                      <div>

                        <strong>
                          {transaction.name}
                        </strong>

                        <span>
                          {isIncome
                            ? 'Money received'
                            : 'Money spent'}
                        </span>

                      </div>

                    </div>

                    {/* CATEGORY */}

                    <span className="category-badge">
                      {transaction.category}
                    </span>

                    {/* DATE */}

                    <span className="transaction-date">

                      {formatDate(
                        transaction.date
                      )}

                    </span>

                    {/* AMOUNT */}

                    <strong
                      className={
                        isIncome
                          ? 'amount-income'
                          : 'amount-expense'
                      }
                    >

                      {isIncome
                        ? '+'
                        : '-'}

                      ₹
                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        'en-IN'
                      )}

                    </strong>

                    {/* ACTIONS */}

                    <div className="table-actions">

                      <button
                        type="button"
                        title="Edit"
                        onClick={() =>
                          handleEditClick(
                            transaction
                          )
                        }
                      >

                        <Pencil
                          size={16}
                          strokeWidth={1.8}
                        />

                      </button>

                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          handleDelete(
                            transaction.id
                          )
                        }
                      >

                        <Trash2
                          size={16}
                          strokeWidth={1.8}
                        />

                      </button>

                    </div>

                  </div>

                )
              }
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredTransactions.length ===
              0 && (

              <div className="no-transactions">

                <div>

                  <FileSearch
                    size={24}
                    strokeWidth={1.8}
                  />

                </div>

                <h3>
                  No transactions found
                </h3>

                <p>
                  {transactions.length === 0
                    ? 'You have not added any transactions yet.'
                    : 'Try changing your search or filter.'}
                </p>

              </div>

            )}

        </div>

      </div>

    </div>
  )
}

export default Transactions