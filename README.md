# Math Quest: Nana & Jimi

A gamified English Math learning application where students learn mathematical vocabulary through interactive quizzes.

## Features

- **Character Selection**: Choose between Nana (female) or Jimi (male)
- **10 Major Levels** × **10 Minor Levels** = **100 Challenges**
- **Question Types**: Multiple Choice, Fill-in-the-Blank, True/False
- **Microsoft TTS**: Click "Play Question" to hear questions read aloud
- **Progress Tracking**: Points, achievements, and character evolution
- **Admin Panel**: Add, edit, and manage question bank
- **English Vocabulary Focus**: sum, difference, product, quotient, etc.
- **Multi-tenant Support**: Multiple schools/organizations
- **Role-based Access**: Super Admin, School Admin, Teacher, Student

---

## 🚀 How to Run the Platform

### Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** (already configured)

### Step 1: Install Dependencies

```bash
cd math-quest
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

---

## 👤 Super Admin Guide

### First Login (Creating Your Admin Account)

1. **Start the app** with `npm run dev`
2. **Click "Sign Up"** on the login page
3. **Fill in your details**:
   - Full Name: Your name
   - Email: Your email address
   - Password: Create a secure password (min 6 characters)
4. **Check your email** for the confirmation link
5. **Click the confirmation link** to activate your account
6. **Sign in** with your credentials

> **Important**: The **first user** to sign up automatically becomes the **Super Admin**. This user has full access to manage all schools, users, and the question bank.

### Super Admin Capabilities

As a Super Admin, you can:

1. **Dashboard Overview**
   - View total schools, students, and questions
   - Quick access to admin functions

2. **Manage Schools**
   - Add new schools/organizations
   - Delete schools (affects all users in that school)
   - View school codes

3. **Manage Users**
   - View all registered users
   - Change user roles (Super Admin, School Admin, Teacher, Student)
   - Delete users

4. **Question Bank**
   - Access the game admin panel
   - Manage both local and database questions
   - Add new questions to the shared database

---

## 🎮 User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Super Admin** | Platform owner | Full access to all schools, users, and database questions |
| **School Admin** | School principal | Manage users and questions within their school |
| **Teacher** | Instructor | View student progress, manage class questions |
| **Student** | Learner | Play the game, track personal progress |

---

## 📁 Project Structure

```
math-quest/
├── src/
│   ├── components/
│   │   ├── Login.tsx         # Login screen
│   │   ├── Signup.tsx        # Registration screen
│   │   ├── Dashboard.tsx     # Admin dashboard
│   │   ├── CharacterSelect.tsx
│   │   ├── LevelSelect.tsx
│   │   ├── Quiz.tsx
│   │   ├── Result.tsx
│   │   ├── Reward.tsx
│   │   └── Admin.tsx
│   ├── AuthContext.tsx       # Authentication context
│   ├── supabase.ts           # Supabase client
│   ├── data.ts               # Question bank & rewards
│   ├── types.ts              # TypeScript interfaces
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── .env                      # Environment variables
├── package.json
└── vite.config.ts
```

---

## 🔧 Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Supabase** (Auth & Database)
- **CSS3** with animations
- **Web Speech API** (TTS)
- **LocalStorage** (local progress)

---

## Game Structure

```
Level 1: Numbers & Basic Operations
├── 1-1: Addition (SUM)
├── 1-2: Subtraction (DIFFERENCE)
├── 1-3: Multiplication (PRODUCT)
├── 1-4: Division (QUOTIENT)
└── 1-5: Mixed Operations

Character Evolution:
├── Levels 1-3: Little Student
├── Levels 4-6: Smart Student
└── Levels 7-10: Little Doctor (Dr. Nana/Jimi)
```

---

## English Math Vocabulary

| Word | Meaning | Example |
|------|---------|---------|
| SUM | Result of addition | 5 + 3 = 8 (the sum) |
| DIFFERENCE | Result of subtraction | 9 - 4 = 5 (the difference) |
| PRODUCT | Result of multiplication | 4 × 3 = 12 (the product) |
| QUOTIENT | Result of division | 20 ÷ 4 = 5 (the quotient) |

---

## Text-to-Speech

The app uses the browser's built-in Speech Synthesis API. For best results:
- Use Chrome or Edge (best Microsoft voice support)
- Click "Play Question" button to hear the question

---

## License

MIT - Feel free to use and modify for educational purposes!
