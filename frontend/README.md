# 💰 SpendWise

> A modern personal finance and budget management web application designed to help users track their money, manage budgets, and understand their spending habits.

SpendWise helps users keep their finances organized in one place. Users can securely create an account, record income and expenses, create monthly budgets, receive budget alerts, and analyze their financial activity through a visual dashboard.

---

## ✨ Features

### 🔐 Authentication

- User registration
- Secure login
- Supabase Authentication
- User-specific financial data
- Automatic redirection for unauthenticated users
- Logout functionality

### 📊 Dashboard

The dashboard provides a quick overview of the user's finances.

It includes:

- Total income
- Total expenses
- Current balance
- Savings rate
- Monthly budget
- Monthly spending
- Remaining budget
- Weekly spending overview
- Recent transactions

---

### 💳 Transaction Management

Users can manage their financial transactions easily.

Supported operations:

- Add transactions
- Edit transactions
- Delete transactions
- Search transactions
- Filter by income/expense
- Filter by category
- Filter by date
- Categorize expenses

Supported categories include:

- Food
- Transport
- Shopping
- Entertainment
- Bills
- Health
- Education
- Other

---

### 💰 Budget Management

Users can create and manage monthly budgets for different spending categories.

Features include:

- Create budgets
- Edit budgets
- Delete budgets
- Track spending against budgets
- View budget percentage usage
- Safe budget status
- Budget warning status
- Budget exceeded status

Budget thresholds:

| Usage | Status |
|---|---|
| Below 80% | 🟢 Safe |
| 80% – 99% | 🟡 Warning |
| 100% or more | 🔴 Exceeded |

---

### 📧 Budget Email Notifications

SpendWise can automatically notify users when their budget reaches an important threshold.

#### 80% Budget Warning

Users receive a warning email when they use 80% or more of a budget.

#### 100% Budget Exceeded

Users receive an alert when their spending reaches or exceeds the budget limit.

The email includes:

- Category
- Month
- Budget amount
- Amount spent
- Percentage used
- Remaining amount

To prevent notification spam, SpendWise tracks the previous budget alert status and only sends notifications when the status changes.

---

### 📈 Analytics

SpendWise provides financial insights based on the user's transactions.

Analytics include:

- Total income
- Total expenses
- Savings
- Savings rate
- Spending by category
- Income vs expenses
- Largest spending category
- Spending insights

Charts are displayed using Recharts.

---

### ⚙️ Settings

Users can manage their account preferences.

Settings include:

- Update profile name
- View registered email
- Change preferred currency
- Save profile settings
- Save currency preference
- Logout

Supported currencies:

- 🇮🇳 INR
- 🇺🇸 USD
- 🇪🇺 EUR
- 🇬🇧 GBP

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router
- Lucide React
- Recharts

### Backend / Database

- Supabase
- Supabase Authentication
- Supabase PostgreSQL Database
- Supabase Edge Functions

### Email

- Resend
- Supabase Edge Functions

### Development

- Git
- GitHub
- Visual Studio Code
- npm

---

