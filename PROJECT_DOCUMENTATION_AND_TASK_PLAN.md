# Laboratorians 2000 — Technical Documentation

**Version:** 2.2
**Date:** March 1, 2026
**Status:** Active Development
**Classification:** Internal — Developers & Stakeholders

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Purpose & Objectives](#2-purpose--objectives)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Page Flow & Routing](#5-page-flow--routing)
6. [Authentication Module](#6-authentication-module)
7. [User Image Verification — Registration](#7-user-image-verification--registration)
8. [Dashboard](#8-dashboard)
9. [Members Directory — My Friends](#9-members-directory--my-friends)
10. [Professional Notices](#10-professional-notices)
11. [Urgent Requests](#11-urgent-requests)
12. [Account Settings & Profile Management](#12-account-settings--profile-management)
13. [Notification & Email Alert Module](#13-notification--email-alert-module)
14. [Theme System — Dark Mode & Light Mode](#14-theme-system--dark-mode--light-mode)
15. [Responsive Design — 100% Responsiveness](#15-responsive-design--100-responsiveness)
16. [Data Validation & Matching Logic](#16-data-validation--matching-logic)
17. [Error Handling](#17-error-handling)
18. [Security & Privacy Considerations](#18-security--privacy-considerations)
19. [Performance Considerations](#19-performance-considerations)
20. [Development Task Plan](#20-development-task-plan)
21. [Future Improvement Suggestions](#21-future-improvement-suggestions)

---

## 1. Project Overview

| Property | Detail |
|---|---|
| **Project Name** | Laboratorians 2000 (Lab 2000) |
| **URL** | `https://laboratorians2000.com` |
| **Description** | An exclusive alumni directory, communication platform, and professional networking system built for the SSC Batch 2000 graduates of Government Laboratory High School (GLHS), Dhaka. |
| **Target Users** | GLHS SSC Batch 2000 alumni only (closed community) |
| **Total Pre-Seeded Records** | 261 alumni (Name, Section, Roll Number, Profile Image) |
| **Active Registered Users** | 31 |
| **Class Sections** | Section A, Section B, Section C, Section D |
| **Roll Range** | 1–71 per section |
| **Default Theme** | Light Mode (with Dark Mode toggle available) |
| **Theme Persistence** | Stored in `localStorage` + system preference detection |
| **Responsiveness** | 100% responsive — Mobile, Tablet, Desktop, Large Desktop |

The system contains a **pre-loaded database** of all batch 2000 students. Each record stores the student's full name, class section, roll number, and an original school-era profile photograph (black-and-white). This pre-seeded data serves as the foundation for the **image-verified registration** system described in Section 7.

---

## 2. Purpose & Objectives

### Primary Objectives

1. **Identity-Verified Registration** — Ensure only genuine GLHS Batch 2000 alumni can register by validating their identity against a pre-existing database and requiring photo confirmation.
2. **Central Alumni Directory** — Provide a searchable, filterable directory of all batchmates with contact information, professional details, and school photographs.
3. **Professional Networking** — Enable alumni to post professional requirements, business services, and career opportunities for the community.
4. **Urgent Community Support** — Facilitate time-sensitive requests such as blood donations and emergency assistance.
5. **Event-Driven Notifications** — Deliver real-time email and in-app alerts for critical user actions (login, registration, urgent requests).

### Design Philosophy

The application must deliver a **premium, professional, and unique** visual experience that stands apart from generic templates. Every screen — from login to dashboard to account settings — must feel crafted, polished, and intentional. The design supports **Dark Mode and Light Mode** (Light Mode default) with seamless theme switching, ensuring both modes are equally refined with proper contrast, readable typography, and a cohesive brand identity centered around the coral/salmon primary color. The entire application must be **100% responsive** — every page, component, form, table, grid, modal, and slide-out panel must render flawlessly on mobile phones (320px), tablets (768px), laptops (1024px), desktops (1440px), and large screens (1920px+). There are no desktop-only features; every feature must be fully usable on every screen size.

### Business Goals

- Reconnect 261 alumni who graduated together in 2000
- Enable professional business networking within a trusted circle
- Provide an emergency support channel for community members
- Maintain privacy — all data visible only to verified members
- Deliver a premium, professional, and unique UI/UX that reflects the prestige of the alumni community

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Laravel (PHP) | REST API, authentication, database ORM (Eloquent), email queue, notification system, image verification logic |
| **Frontend** | Next.js (React) | Server-side rendering, client-side routing, page transitions, API consumption |
| **Styling** | SCSS + Tailwind CSS | Utility-first responsive styling with SCSS for component-specific overrides |
| **UI Components** | ShadCN UI | Pre-built accessible component library (buttons, dropdowns, modals, tabs, tables, toasts) |
| **Database** | MySQL | Relational storage for user profiles, pre-seeded alumni records, notifications, urgent requests |
| **Email** | Laravel Mail (SMTP / Mailgun / SES) | Transactional email notifications for login, registration, urgent requests |
| **File Storage** | Laravel Storage (local / S3) | Profile images, school photographs, attachment uploads |
| **Authentication** | Laravel Sanctum | Token-based SPA authentication between Next.js and Laravel |
| **Real-Time** | Laravel Broadcasting + Pusher (or Reverb) | In-app notification delivery to the dashboard notification panel |
| **Theme Management** | `next-themes` | Dark/light mode toggling, system preference detection, localStorage persistence, flash-free SSR hydration |

### Architecture Rationale

- **Laravel** handles all business logic, database queries, image-matching validation, and email dispatch. It serves as a stateless REST API.
- **Next.js** consumes the Laravel API and renders the full user interface. Server-side rendering ensures fast initial page loads and SEO where applicable.
- **ShadCN UI** provides consistent, accessible UI primitives that align with the existing design language (coral buttons, pill shapes, clean tables). ShadCN's built-in CSS variable system natively supports dark/light theme switching.
- **Tailwind CSS + SCSS** provides rapid utility styling while SCSS allows scoped, maintainable overrides for complex component states. Tailwind's `dark:` variant class prefix is used throughout for theme-aware styling.
- **`next-themes`** manages theme state (light/dark/system), persists user preference in `localStorage`, detects OS-level preference via `prefers-color-scheme`, and prevents flash-of-unstyled-content during SSR hydration.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │  │
│  │  │  ShadCN  │ │ Tailwind │ │   SCSS   │ │  React State│  │  │
│  │  │    UI    │ │ CSS+dark:│ │  Modules │ │  (Context)  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │  next-themes ThemeProvider (light | dark | system)  │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │ REST API Calls (Axios / Fetch)      │
│                           │ + WebSocket (Notifications)         │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LARAVEL BACKEND                            │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Sanctum    │  │ Controllers│  │ Notification│  │  Mail    │  │
│  │ Auth Guard │  │ & Services │  │  System     │  │  Queue   │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Eloquent   │  │ Image      │  │ Broadcasting│  │ Storage  │  │
│  │ ORM        │  │ Verify     │  │ (Pusher)   │  │ (S3/Local│  │
│  └─────┬──────┘  └────────────┘  └────────────┘  └──────────┘  │
│        │                                                        │
└────────┼────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│     MySQL       │    │  File Storage   │
│  ┌───────────┐  │    │  ┌───────────┐  │
│  │ users     │  │    │  │ /school-  │  │
│  │ alumni_   │  │    │  │  photos/  │  │
│  │  records  │  │    │  │ /profile- │  │
│  │ notifi-   │  │    │  │  images/  │  │
│  │  cations  │  │    │  │ /uploads/ │  │
│  │ urgent_   │  │    │  └───────────┘  │
│  │  requests │  │    │                 │
│  └───────────┘  │    │                 │
└─────────────────┘    └─────────────────┘
```

### Database Schema — Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `alumni_records` | Pre-seeded database of all 261 students | `id`, `first_name`, `last_name`, `section`, `roll_number`, `profile_image_path`, `is_registered` |
| `users` | Registered user accounts | `id`, `alumni_record_id` (FK), `email`, `phone`, `password`, `is_active`, `email_verified_at` |
| `notifications` | In-app notification log | `id`, `user_id`, `type`, `title`, `body`, `read_at`, `created_at` |
| `notification_settings` | Per-user notification preferences | `id`, `user_id`, `email_on_login`, `email_on_registration`, `email_on_urgent`, `inapp_on_login`, `inapp_on_registration`, `inapp_on_urgent` |
| `urgent_requests` | Emergency community requests | `id`, `user_id`, `title`, `type_of_emergency`, `urgency_level`, `description`, `status`, `created_at` |
| `professional_notices` | Business/professional networking posts | `id`, `user_id`, `title`, `requirement_type`, `industry`, `location`, `details` |
| `user_preferences` | Per-user settings including theme | `id`, `user_id`, `theme` (`light`/`dark`/`system`), `created_at`, `updated_at` |

---

## 5. Page Flow & Routing

### Entry Point — The Login Page

The **Login Page** is the very first page of the application. All unauthenticated visitors arrive here. From the login page, users can navigate to Registration or Forgot Password.

```
ENTRY POINT
    │
    ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  LOGIN PAGE  │────▶│ REGISTRATION PAGE │────▶│  IMAGE VERIFY    │
│  /login      │     │ /registration     │     │  CONFIRMATION    │
│              │◀────│                   │     │  (modal/step)    │
│  • Email     │     │  • First Name*    │     │                  │
│  • Password  │     │  • Last Name*     │     │  • Shows photo   │
│  • Login btn │     │  • Section*       │     │  • "Is this you?"│
│  • Forgot Pw │     │  • Roll Number    │     │  • Yes / No      │
│              │     │  • Email*         │     └────────┬─────────┘
└──────┬───────┘     │  • Phone*         │              │ Yes
       │             │  • Password*      │              ▼
       │ Success     │  • Submit         │     ┌──────────────────┐
       │             │  • Photo preview  │     │  ACCOUNT CREATED │
       │             └──────────────────┘     │  Redirect → Login│
       │                                       └──────────────────┘
       ▼
┌──────────────────────────────────────────────────────────────┐
│                     DASHBOARD  /user-dashboard               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  My      │ │Profession│ │  Urgent  │ │  Account &     │  │
│  │  Friends │ │  Notices │ │ Requests │ │  Profile       │  │
│  │ /members │ │/profess..│ │/urgent.. │ │ /account-set.. │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Complete Route Table

| Route | Page | Auth Required | Description |
|---|---|---|---|
| `/login` | Login | No | **Entry point.** Email + Password login form |
| `/registration` | Registration | No | Identity-verified registration with image confirmation |
| `/lost-password` | Forgot Password | No | Email-based password reset request |
| `/reset-password` | Reset Password | No (via token) | Set new password from email link |
| `/user-dashboard` | Dashboard | Yes | Statistics overview, alumni table, urgent requests sidebar |
| `/members` | My Friends | Yes | Searchable/filterable alumni photo grid directory |
| `/professional-connection` | Professional Notices | Yes | Post and browse professional requirements |
| `/urgent-section` | Urgent Requests | Yes | Submit and view emergency community requests |
| `/account-settings` | Account & Profile | Yes | 3-tab interface: My Profile, School Memories, Password |
| `/member-profile` | Member Profile | Yes | Read-only view of another member's profile |

---

## 6. Authentication Module

### 6.1 Login Page (`/login`)

The login page is the **first screen** every user sees. It serves as the application entry point.

**Layout (from screenshot):**

```
┌─────────────────────────────────────────────────────────────┐
│                        lab2000.                              │
├─────────────────────────────┬───────────────────────────────┤
│                             │█                              │
│  Welcome back! 👋           │█  ┌───┐ ┌───┐ ┌───┐         │
│                             │█  │░░░│ │░░░│ │░░░│         │
│  Email *                    │█  └───┘ └───┘ └───┘         │
│  ┌────────────────────────┐ │█  ○ ─── ─── ─── ───         │
│  │ info@sklentr.com       │ │█  ○ ─── ─── ─── ───         │
│  └────────────────────────┘ │█  ○ ─── ─── ─── ───         │
│                             │█  ○ ─── ─── ─── ───         │
│  Password *                 │█  ○ ─── ─── ─── ───         │
│  ┌────────────────────────┐ │█  ○ ─── ─── ─── ───         │
│  │ ••••••••••••••••       │ │█  ○ ─── ─── ─── ───         │
│  └────────────────────────┘ │█  (Directory preview         │
│                             │█   skeleton illustration)    │
│  ┌──────────┐               │█                              │
│  │ Login  ↗ │               │                               │
│  └──────────┘               │                               │
│  Forget Password?           │                               │
│                             │                               │
├─────────────────────────────┴───────────────────────────────┤
```

**UI Elements:**

| Element | Detail |
|---|---|
| Logo | `lab2000.` — bold serif, centered above the card |
| Theme toggle | Sun/Moon icon button in the top-right corner; toggles between light and dark mode (see Section 14) |
| Card layout | Two-column: form (left), directory skeleton illustration (right), separated by red vertical accent line |
| Greeting | "Welcome back!" with wave emoji |
| Email field | Text input, light background, required (*) |
| Password field | Password input (masked), required (*) |
| Login button | Coral/red pill button with arrow icon: `Login ↗` |
| Forgot password | Text link below button: "Forget Password?" → navigates to `/lost-password` |
| Registration link | Accessible from header or a secondary link (navigates to `/registration`) |

**Authentication Flow:**

```
1. User enters Email + Password
2. Next.js sends POST /api/login to Laravel
3. Laravel validates credentials via Sanctum
4. Success → Laravel returns auth token + user data
         → Next.js stores token, redirects to /user-dashboard
         → Triggers "login" notification event (see Section 13)
5. Failure → Laravel returns 401 / 422
          → Next.js displays inline error message
```

### 6.2 Forgot Password Page (`/lost-password`)

**Layout (from screenshot):**

| Element | Detail |
|---|---|
| Header | `lab2000.` logo (left), "Lab2000 Login" coral pill button (right) |
| Heading | "Lost Password" — centered, bold |
| Instruction | "Please enter your email address. You will receive a reset password." |
| Field | Email text input |
| Button | "Get New Password" — full-width coral/salmon button |
| Navigation | "Go to login page" link |
| Footer section | Blue background FAQ: "Do you have any questions" with "Contact Us" button |

**Password Reset Flow:**

```
1. User enters registered email
2. POST /api/forgot-password → Laravel
3. Laravel generates time-limited reset token
4. Sends reset link email to user
5. User clicks email link → /reset-password?token=xxx
6. User sets new password → POST /api/reset-password
7. Success → Redirect to /login with success message
```

---

## 7. User Image Verification — Registration

This is the **core identity verification feature** of the application. It prevents unauthorized registrations by validating the user's input against a pre-seeded alumni database and requiring visual photo confirmation.

### 7.1 Pre-Seeded Alumni Database

The system contains **261 pre-loaded alumni records** in the `alumni_records` table:

| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Auto-increment |
| `first_name` | VARCHAR(100) | Student's first name |
| `last_name` | VARCHAR(100) | Student's last name |
| `section` | ENUM('A','B','C','D') | Class 10 section |
| `roll_number` | INT (1–71) | Class 10 roll number |
| `profile_image_path` | VARCHAR(255) | Path to stored school photograph |
| `is_registered` | BOOLEAN | Whether this alumni has already registered |
| `created_at` | TIMESTAMP | Record creation timestamp |

Every record has a corresponding **school-era photograph** (black-and-white) stored in the file system.

### 7.2 Registration Page (`/registration`)

**Layout (from screenshot):**

```
┌─────────────────────────────────────────────────────────────────────┐
│  lab2000.                                      [Lab2000 Login]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Laboratorians batch 2000         First Name *       Last Name *    │
│  students can only register       ┌───────────┐     ┌───────────┐  │
│  here                             │ First Name│     │ Last Name │  │
│                                   └───────────┘     └───────────┘  │
│  Thanks friends for choosing                                        │
│  to register with us. Your        Section in Class 10 *  Roll in   │
│  information will be kept          ┌──────────────┐   Class 10     │
│  only among the students of        │ Section A  ▼ │   ┌────────┐  │
│  Laboratorians batch 2000.         └──────────────┘   │ 1    ▼ │  │
│  We will not be publishing                             └────────┘  │
│  your information to the                                            │
│  public. It will be used           Email *           Phone/WhatsApp│
│  only among your batchmates.       ┌───────────┐    Number *       │
│                                    │ Email     │    ┌───────────┐  │
│                                    └───────────┘    │ Write with│  │
│                                                     │ country   │  │
│                                    Password *        │ code      │  │
│                                    ┌───────────┐    └───────────┘  │
│                                    │ Password  │                    │
│                                    └───────────┘                    │
│                                                                     │
│                                    ┌────────────────────────────┐   │
│                                    │          Submit            │   │
│                                    └────────────────────────────┘   │
│                                                                     │
│                                    What about an old photo?         │
│                                                                     │
│                                         ┌──────────┐               │
│                                         │          │               │
│                                         │  👤      │               │
│                                         │ default  │               │
│                                         │ silhouette│              │
│                                         │          │               │
│                                         └──────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Registration Form Fields:**

| Field | Type | Required | Validation | Used for Image Lookup |
|---|---|---|---|---|
| First Name | Text input | Yes | Min 2 chars, alpha only | Yes |
| Last Name | Text input | Yes | Min 2 chars, alpha only | Yes |
| Section in Class 10 | Dropdown | Yes | Section A / B / C / D | Yes |
| Roll in Class 10 | Dropdown | No | 1–71 | Yes |
| Email | Email input | Yes | Valid email, unique | No |
| Phone/WhatsApp Number | Text input | Yes | With country code | No |
| Password | Password input | Yes | Min 8 chars, mixed case + number | No |

**Left Column Content:**
- Heading: "Laboratorians batch 2000 students can only register here"
- Privacy notice: "Thanks friends for choosing to register with us. Your information will be kept only among the students of Laboratorians batch 2000. We will not be publishing your information to the public. It will be used only among your batchmates."

**Photo Preview Area:**
- Below the form: "What about an old photo?"
- Default state: Silhouette avatar (dark gray person icon)
- After match: Replaced with the actual stored school photograph

### 7.3 Image Verification Flow — Step by Step

```
STEP 1: USER FILLS IDENTIFICATION FIELDS
─────────────────────────────────────────
User enters: First Name + Last Name + Section + Roll Number
    │
    ▼ (onChange / onBlur event triggers AJAX lookup)

STEP 2: REAL-TIME DATABASE LOOKUP
─────────────────────────────────
Next.js sends: GET /api/alumni/verify?
    first_name=Rishad&last_name=Wahid&section=D&roll=15
    │
    ▼
Laravel Controller:
    → Query alumni_records WHERE first_name AND last_name
      AND section AND roll_number MATCH
    → Apply case-insensitive comparison
    → Apply fuzzy matching tolerance for minor name variations
    │
    ├── NO MATCH FOUND
    │   → Return { matched: false }
    │   → Frontend shows silhouette avatar (default)
    │   → Photo area text: "What about an old photo?"
    │   → Submit button remains enabled (registration allowed
    │     but without photo verification flag)
    │
    └── MATCH FOUND
        → Return { matched: true, image_url: "/storage/school-photos/D-15.jpg",
                   record_id: 42 }
        → Frontend replaces silhouette with actual school photo
        │
        ▼

STEP 3: IMAGE CONFIRMATION DIALOG
──────────────────────────────────
Frontend displays the stored school photograph and prompts:

    ┌─────────────────────────────────────┐
    │                                     │
    │         ┌──────────────┐            │
    │         │              │            │
    │         │  [B&W school │            │
    │         │   photo of   │            │
    │         │   the match] │            │
    │         │              │            │
    │         └──────────────┘            │
    │                                     │
    │   "Is this your photo?"             │
    │                                     │
    │   ┌──────────┐  ┌──────────────┐    │
    │   │  Yes, ✓  │  │  No, not me  │    │
    │   │ this is  │  │              │    │
    │   │   me     │  │              │    │
    │   └──────────┘  └──────────────┘    │
    │                                     │
    └─────────────────────────────────────┘

    │                          │
    ▼ YES                      ▼ NO
    │                          │
    User confirms.             Photo area resets to silhouette.
    image_confirmed = true     image_confirmed = false
    Submit becomes active      User can re-enter different
    with full verification.    name/section/roll to retry.
    │                          The form remains usable but
    │                          the account will be flagged
    │                          for manual admin review.
    │
    ▼

STEP 4: FORM SUBMISSION
────────────────────────
POST /api/register
{
    first_name: "Rishad",
    last_name: "Wahid",
    section: "D",
    roll_number: 15,
    email: "rishad@example.com",
    phone: "+8801XXXXXXXXX",
    password: "••••••••",
    alumni_record_id: 42,       // from the matched record
    image_confirmed: true        // user confirmed the photo
}
    │
    ▼

STEP 5: BACKEND PROCESSING
───────────────────────────
Laravel:
    → Validate all fields
    → Verify alumni_record_id exists and is_registered = false
    → Create user account linked to alumni_record
    → Set alumni_records.is_registered = true (prevent duplicate registration)
    → Dispatch "registration" notification event (see Section 13)
    → Return success response
    │
    ▼

STEP 6: REDIRECT
─────────────────
Next.js shows success toast → Redirects to /login
User logs in → Arrives at /user-dashboard
```

### 7.4 Image Verification — API Contract

**Lookup Endpoint:**

```
GET /api/alumni/verify
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `first_name` | string | Yes | User-entered first name |
| `last_name` | string | Yes | User-entered last name |
| `section` | string | Yes | A, B, C, or D |
| `roll_number` | integer | No | 1–71 |

**Success Response (match found):**

```json
{
    "matched": true,
    "record_id": 42,
    "image_url": "https://laboratorians2000.com/storage/school-photos/D-15.jpg",
    "full_name": "Rishad Bin Wahid",
    "already_registered": false
}
```

**Failure Response (no match):**

```json
{
    "matched": false,
    "message": "No matching alumni record found. Please verify your name, section, and roll number."
}
```

**Already Registered Response:**

```json
{
    "matched": true,
    "already_registered": true,
    "message": "This alumni record has already been registered. If this is you, please use the login page."
}
```

### 7.5 UI Behavior Summary

| State | Photo Area | Confirmation Dialog | Submit Button |
|---|---|---|---|
| Initial (no input) | Default silhouette avatar | Hidden | Disabled |
| Fields entered, lookup in progress | Loading spinner | Hidden | Disabled |
| No match found | Silhouette avatar remains | Hidden | Enabled (flagged for review) |
| Match found, awaiting confirmation | Actual school photo displayed | Visible: "Is this your photo?" | Disabled until confirmed |
| User confirms "Yes" | Photo displayed with green check | Hidden (confirmed) | Enabled (fully verified) |
| User clicks "No" | Resets to silhouette | Hidden | Enabled (flagged for review) |
| Already registered record | Silhouette + warning message | Hidden | Disabled |

---

## 8. Dashboard

### 8.1 Dashboard Overview (`/user-dashboard`)

The dashboard is the **main landing page** after successful login. It provides a summary of platform activity and quick access to all features.

**Layout (from screenshot):**

```
┌──────────┬───────────────────────────────────────────────────────┐
│ lab2000. │[≡]  ⚙ User Dashboard               Rishad Bin Wahid ▾│
├──────────┤                                                       │
│          │ Welcome back, Rishad Bin Wahid 👋                     │
│ ●Dashboard│ Dashboard overview                                   │
│          │                                                       │
│  My      │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  Friends │ │ 👥  261  │ │ 🏢  31  │ │ 👤   0  │ │ 🔴   0  │ │
│          │ │ Total    │ │ Total   │ │ Total   │ │ Total   │ │
│ Profess- │ │ Members  │ │ Active  │ │ Profess.│ │ Urgent  │ │
│ ional    │ │          │ │ Members │ │ Connect.│ │ Request │ │
│ Notices  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│          │                                                       │
│ Urgent   │ Registered Alumni              See all ↗ │ Latest    │
│ Requests │ ┌──────────────────────────────────────┐ │ Urgent    │
│          │ │ Name           │Sect│Number │Blood   │ │ Requests  │
│ Account &│ ├────────────────┼────┼───────┼────────┤ │           │
│ Profile  │ │G.S.Badruddin   │ D  │       │ A+     │ │ (empty)   │
│          │ │b.ahmed@trade.. │    │       │        │ │           │
│ Home     │ │Monzur Al Mur.. │ D  │017141.│ B+     │ │           │
│          │ │monzural@gmai..│    │       │        │ │           │
│          │ │Nafiz Imtiaz.. │ D  │+88017.│ B+     │ │           │
│          │ │nafiz.hassan@..│    │       │        │ │           │
│          │ │Syed Golam Ra..│ D  │       │ A+     │ │           │
│          │ │shawon1234@g.. │    │       │        │ │           │
│          │ │Rishad Bin Wa..│ D  │       │ A+     │ │           │
│          │ │info@sklentr..  │    │       │        │ │           │
│          │ └──────────────────────────────────────┘ │           │
└──────────┴───────────────────────────────────────────┴───────────┘
```

### 8.2 Dashboard Components

**Left Sidebar Navigation:**

| Menu Item | Icon | Route | Description |
|---|---|---|---|
| Dashboard | Grid icon | `/user-dashboard` | Statistics overview (active: red left border) |
| My Friends | People icon | `/members` | Alumni directory with photo grid |
| Professional Notices | Briefcase icon | `/professional-connection` | Business networking posts |
| Urgent Requests | Shield icon | `/urgent-section` | Emergency community requests |
| Account & Profile | Gear icon | `/account-settings` | Profile editing and password |
| Home | House icon | `/` | Return to public homepage |

**Statistics Cards (4-card row):**

| Card | Icon | Current Value | Label |
|---|---|---|---|
| Card 1 | Red circle + people | 261 | Total Members |
| Card 2 | Red circle + building | 31 | Total Active Members |
| Card 3 | Red circle + person | 0 | Total Professional Connection |
| Card 4 | Red circle + alert | 0 | Total Urgent Request |

**Registered Alumni Table:**

| Column | Content |
|---|---|
| Name | Full name (bold) + email below (gray) + avatar circle |
| Section | Single letter: A, B, C, or D |
| Number | Phone number (with country code) or empty |
| Blood group | A+, B+, O+, AB+, etc. |

- "See all ↗" link in the header row navigates to `/members`

**Right Sidebar:**
- "Latest Urgent Requests" — displays most recent urgent requests, currently empty

**Top Bar:**
- Logo: `lab2000.` with sidebar collapse toggle `[≡]`
- Breadcrumb: "⚙ User Dashboard"
- Theme toggle: Sun/Moon icon button — switches between light and dark mode (see Section 14)
- User dropdown (right): "Rishad Bin Wahid ▾"

**User Dropdown Menu (top-right):**

```
┌───────────────────────┐
│  Rishad Bin Wahid      │  (bold)
│  info@sklentr.com      │  (gray)
│───────────────────────│
│  ⚙ Account settings   │  → /account-settings
│  ⊳ Logout             │  (red text)
└───────────────────────┘
```

---

## 9. Members Directory — My Friends

### 9.1 Page Layout (`/members`)

**From screenshot:** A searchable grid of alumni school photographs.

**Page Title:** "Meet your friends"

**Search & Filter Bar:**

| Control | Type | Behavior |
|---|---|---|
| Search | Text input with magnifying glass icon | Searches by name, nickname |
| Blood Group | Dropdown select | Filters by blood type |
| Section | Dropdown select | Filters by section A/B/C/D |
| Active Users | Toggle switch | Shows only registered/active members |
| Search button | Button | Applies all filters |

**Member Photo Grid:**
- Grid layout: ~6 columns, responsive
- Each card displays:
  - School photograph (black-and-white, square with rounded corners)
  - Full name below the photo
  - Email below the name (or "No email found" if not available)
- Clicking a card navigates to `/member-profile?id=XX`

---

## 10. Professional Notices

### 10.1 Page Layout (`/professional-connection`)

**From screenshot:** A list view with slide-out entry form.

**Main Content:**
- Empty state: "No connections found." (red text)

**New Entry Slide-Out Panel (right side):**
- Header: "Professional Connection / New Entry" with close (X) button

| Field | Type | Required | Options |
|---|---|---|---|
| Requirement Title | Text input | No | Free text |
| Requirement Type | Dropdown | Yes | "Professional Advice" + others |
| Industry | Dropdown | No | "Information Technology" + others |
| Location | Text input | No | Free text |
| Requirement Details | Rich Text Editor (WYSIWYG) | Yes | Full formatting toolbar |
| Attachments | File upload | No | Max 64 MB |

- **Submit** button: coral/red with arrow icon

---

## 11. Urgent Requests

### 11.1 Page Layout (`/urgent-section`)

**From screenshot:** A list view with slide-out entry form.

**Main Content:**
- Empty state: "No urgent needs found." (red text)

**New Entry Slide-Out Panel (right side):**
- Header: "Urgent Section / New Entry" with close (X) button

| Field | Type | Required | Options |
|---|---|---|---|
| Title | Text input | Yes | Free text |
| Type of Emergency | Dropdown | Yes | "Blood Donation" + other emergency types |
| Date of Incident | Date picker | No | Format: yyyy-mm-dd |
| Location | Text input | No | Free text |
| Urgency Level | Dropdown | No | "Immediate" + other levels |
| Contact Person | Text input | No | Free text |
| Contact Number | Text input | No | Phone number |
| Description | Rich Text Editor (WYSIWYG) | Yes | Full formatting toolbar |
| Attachment | File upload | No | Max 64 MB |

**Urgent Request Lifecycle:**

```
User submits urgent request
    │
    ▼
POST /api/urgent-requests → Laravel
    │
    ├── Validate all fields
    ├── Store in urgent_requests table (status: "open")
    ├── Dispatch "urgent_request" notification event
    │     ├── Email all users who have email_on_urgent = true
    │     └── In-app notification to all users who have inapp_on_urgent = true
    │
    ▼
Request appears in:
    • Dashboard → "Latest Urgent Requests" sidebar
    • Urgent Requests → main listing page
    • All notified users receive email + dashboard notification
```

---

## 12. Account Settings & Profile Management

### 12.1 Page Layout (`/account-settings`)

**From screenshot:** A 3-tab interface for profile, memories, and password management.

**Tab Bar:**

| Tab | Icon | Label | Active Style |
|---|---|---|---|
| Tab 1 | Person icon | My Profile | Coral text + underline |
| Tab 2 | Image icon | School Memories | Gray text |
| Tab 3 | Lock icon | Password | Red/coral text when active |

### 12.2 Tab 1: My Profile

**Complete field inventory from screenshots:**

**Basic Information:**

| Field | Type | Example Value |
|---|---|---|
| School Nick Name | Text | "Rosen" |
| School House | Dropdown | "Omar Khaiyam" |
| Blood Group * | Dropdown | "A+" |
| Phone | Text | — |
| Current City | Text | "Toronto" |
| Home District | Dropdown | "Dhaka" |

**Current Photo:** Displays uploaded profile image.

**Location & Professional:**

| Field | Type | Example Value |
|---|---|---|
| Current Address | Text | "Finch - Warden" |
| City * | Text | "Toronto" |
| Country * | Dropdown (searchable) | "Canada" |
| Academic Qualification | Dropdown | "Masters/Equivalent" |
| Current Work Position | Text | "CTO" |
| Current Work Place | Text | "Sklentr Inc." |

**Previous Employment (dynamic table):**

| Column | Type |
|---|---|
| Name of Organization | Text |
| Designation | Text |
| Experience (in years) | Number |

- "Add New" button to add rows. Multiple entries supported.

**Social Media Links:** Facebook, LinkedIn, Instagram, YouTube (URL inputs with placeholders).

**Emergency Contact:** Phone + Relation with member (dropdown: Spouse, Parent, Sibling, etc.)

**Nostalgia Questions:** Best friend in school, favorite teacher, finished school (Yes/No), favorite title.

**Memories Editor:** "Write your memories about school" — full WYSIWYG rich text editor.

**Business Services Section:**
- Toggle: "Do you own any business to provide service for your friends?" (Yes/No)
- Dynamic table: Service Name + Description
- "Add New Service" button

**Submit:** "Update" button (coral/red).

### 12.3 Tab 2: School Memories

Dedicated tab for school memory content and shared nostalgia.

### 12.4 Tab 3: Password

**From screenshot:**

| Field | Type |
|---|---|
| Current Password | Password input |
| Enter Password (New) | Password input |
| Confirm Password | Password input |

- **Update** button (coral/red with arrow icon)

---

## 13. Notification & Email Alert Module

### 13.1 Overview

The notification system is a **cross-cutting concern** that triggers automatically when specific user actions occur. It operates through two delivery channels (email and in-app) and respects per-user preferences.

### 13.2 Trigger Events

| Event | Trigger Condition | Who Gets Notified | Notification Content |
|---|---|---|---|
| **Login** | User successfully logs in | All admins + optionally all members | "[User Name] has logged in to Lab2000" |
| **Registration** | New user completes image-verified registration | All admins + all members | "A new batchmate [Name] from Section [X] has joined Lab2000!" |
| **Urgent Request** | User submits an urgent request | All members who have enabled urgent notifications | "[User Name] posted an urgent request: [Title] — [Emergency Type]" |

### 13.3 Delivery Channels

#### Channel 1: Email Notifications

```
Event occurs (login / registration / urgent request)
    │
    ▼
Laravel Event fired → Listener dispatches Mail job to queue
    │
    ▼
For EACH user where notification_settings.email_on_[event] = true:
    │
    ▼
Laravel Mail sends branded HTML email via configured SMTP/SES/Mailgun
    │
    ▼
Email delivered to user's inbox
```

**Email Template Structure:**

```
┌─────────────────────────────────────┐
│           lab2000.                    │
│─────────────────────────────────────│
│                                     │
│  Hi [Recipient Name],              │
│                                     │
│  [Notification message body]        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     View on Dashboard    ↗   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ─────────────────────────────────  │
│  Laboratorians 2000                 │
│  You received this email because    │
│  your notification settings allow   │
│  it. Manage preferences:            │
│  [Notification Settings]            │
│                                     │
└─────────────────────────────────────┘
```

#### Channel 2: In-App Dashboard Notifications

In-app notifications appear in the dashboard via a **notification bell icon** in the top bar and within the **"Latest Urgent Requests"** sidebar widget.

```
Event occurs
    │
    ▼
Laravel creates record in notifications table
    │
    ▼
Laravel Broadcasting dispatches real-time event via Pusher/Reverb
    │
    ▼
Next.js client receives WebSocket event
    │
    ▼
Dashboard updates:
    • Notification bell shows unread count badge
    • Notification dropdown shows new entry
    • "Latest Urgent Requests" sidebar updates (if urgent type)
    • Toast notification appears briefly at top-right
```

**Notification Data Model:**

```json
{
    "id": 1,
    "user_id": 42,
    "type": "registration",
    "title": "New Member Joined!",
    "body": "Rishad Bin Wahid from Section D has registered on Lab2000.",
    "action_url": "/member-profile?id=42",
    "read_at": null,
    "created_at": "2026-03-01T10:30:00Z"
}
```

### 13.4 Notification & Email Settings (Per-User Preferences)

Each user has a dedicated notification settings interface accessible from **Account & Profile** or a dedicated settings sub-tab. The settings are stored in the `notification_settings` table.

**Settings UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Notification Settings                                       │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  EMAIL NOTIFICATIONS                                        │
│  ─────────────────────────────────────────────              │
│                                                             │
│  ┌─────────────────────────────┬──────────────────────────┐ │
│  │ Event                       │ Email Enabled            │ │
│  ├─────────────────────────────┼──────────────────────────┤ │
│  │ New Member Registration     │  [■ ON ]  [ OFF]         │ │
│  │ Member Login Activity       │  [ ON ]  [■ OFF]         │ │
│  │ Urgent Request Submission   │  [■ ON ]  [ OFF]         │ │
│  └─────────────────────────────┴──────────────────────────┘ │
│                                                             │
│  IN-APP NOTIFICATIONS                                       │
│  ─────────────────────────────────────────────              │
│                                                             │
│  ┌─────────────────────────────┬──────────────────────────┐ │
│  │ Event                       │ In-App Enabled           │ │
│  ├─────────────────────────────┼──────────────────────────┤ │
│  │ New Member Registration     │  [■ ON ]  [ OFF]         │ │
│  │ Member Login Activity       │  [■ ON ]  [ OFF]         │ │
│  │ Urgent Request Submission   │  [■ ON ]  [ OFF]         │ │
│  └─────────────────────────────┴──────────────────────────┘ │
│                                                             │
│  ┌──────────────┐                                           │
│  │ Save Settings│                                           │
│  └──────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Settings Data Model:**

| Column | Type | Default | Description |
|---|---|---|---|
| `user_id` | FK → users | — | Owner of the settings |
| `email_on_registration` | BOOLEAN | `true` | Email when new member registers |
| `email_on_login` | BOOLEAN | `false` | Email when any member logs in |
| `email_on_urgent` | BOOLEAN | `true` | Email when urgent request submitted |
| `inapp_on_registration` | BOOLEAN | `true` | Dashboard alert for new registrations |
| `inapp_on_login` | BOOLEAN | `true` | Dashboard alert for member logins |
| `inapp_on_urgent` | BOOLEAN | `true` | Dashboard alert for urgent requests |

**Default Configuration:**
- All in-app notifications: **ON** by default
- Email for registration and urgent: **ON** by default
- Email for login: **OFF** by default (high frequency, low priority)

### 13.5 Notification System — End-to-End Flow

```
┌──────────────┐
│  USER ACTION  │  (Login / Registration / Urgent Request)
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Laravel Event Fired  │  (UserLoggedIn / UserRegistered / UrgentRequestCreated)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Event Listener                                       │
│                                                       │
│  1. Query all users from notification_settings        │
│  2. For each user:                                    │
│     ├── If email_on_[event] = true:                   │
│     │   └── Dispatch email job to queue               │
│     │                                                 │
│     └── If inapp_on_[event] = true:                   │
│         ├── Insert into notifications table            │
│         └── Broadcast via WebSocket channel            │
│                                                       │
└──────────────────────────────────────────────────────┘
       │                              │
       ▼                              ▼
┌──────────────┐           ┌─────────────────────┐
│  EMAIL QUEUE  │           │  WEBSOCKET BROADCAST │
│              │           │                     │
│  Process via │           │  Pusher / Reverb    │
│  SMTP / SES  │           │  → Next.js client   │
│  / Mailgun   │           │  → Bell badge ++    │
│              │           │  → Toast popup      │
│  Branded HTML│           │  → Sidebar update   │
│  template    │           │                     │
└──────────────┘           └─────────────────────┘
```

---

## 14. Theme System — Dark Mode & Light Mode

### 14.1 Overview

The application supports a **dual-theme system** with Light Mode and Dark Mode. **Light Mode is the default** for all new visitors and new registrations. Users can toggle between themes at any time using the theme switch control present on every page.

| Property | Detail |
|---|---|
| **Default Theme** | Light Mode |
| **Available Modes** | Light, Dark, System (follows OS preference) |
| **Persistence** | `localStorage` key: `theme`; optionally synced to `user_preferences` table for authenticated users |
| **SSR Handling** | `next-themes` injects theme class before hydration to prevent flash-of-wrong-theme |
| **CSS Strategy** | Tailwind `dark:` variant classes + ShadCN CSS custom properties on `:root` / `.dark` |
| **Toggle Location** | Top bar (all pages) — Sun/Moon icon button |

### 14.2 Theme Toggle UI

The theme toggle is a single icon button that appears in the **top bar** of every page — both public pages (Login, Registration, Forgot Password) and authenticated dashboard pages.

**Public Pages (Login, Registration, Forgot Password):**

```
┌─────────────────────────────────────────────────────────┐
│  lab2000.                              [☀/🌙]           │
│                                        theme toggle      │
└─────────────────────────────────────────────────────────┘
```

**Authenticated Dashboard Pages:**

```
┌──────────┬────────────────────────────────────────────────┐
│ lab2000. │[≡]  ⚙ Page Title        [☀/🌙]  User Name ▾  │
│          │                          theme                  │
│          │                          toggle                 │
└──────────┴────────────────────────────────────────────────┘
```

**Toggle Behavior:**

| Current State | Icon Shown | Click Action | Visual Transition |
|---|---|---|---|
| Light Mode (default) | `☀` Sun icon | Switches to Dark Mode | Smooth CSS transition (200ms) on `background-color`, `color`, `border-color` |
| Dark Mode | `🌙` Moon icon | Switches to Light Mode | Smooth CSS transition (200ms) |

**Dropdown Option (optional enhancement):**
Instead of a simple toggle, the button can open a small dropdown with three options:

```
┌─────────────────┐
│  ☀  Light       │  ← Default, always first
│  🌙  Dark        │
│  💻  System      │  ← Follows OS preference
│─────────────────│
│  ✓ = active     │
└─────────────────┘
```

### 14.3 Color Design Tokens

All colors are defined as **CSS custom properties** on `:root` (light) and `.dark` (dark). Tailwind and ShadCN both reference these tokens, ensuring a single source of truth.

**Core Surface & Text Colors:**

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#0F1117` | Page background |
| `--foreground` | `#112337` | `#E8ECF1` | Primary text |
| `--card` | `#FFFFFF` | `#1A1D2B` | Card / panel background |
| `--card-foreground` | `#112337` | `#E8ECF1` | Card text |
| `--muted` | `#F5F6F8` | `#252836` | Input backgrounds, secondary surfaces |
| `--muted-foreground` | `#6B7280` | `#9CA3AF` | Secondary/placeholder text |
| `--border` | `#E5E7EB` | `#2D3348` | Borders, dividers, table lines |
| `--input` | `#F5F6F8` | `#252836` | Form input background |

**Brand & Interactive Colors (unchanged across themes):**

| Token | Value (Both Modes) | Usage |
|---|---|---|
| `--primary` | `#E8604C` | Primary buttons (Login, Submit, Update), active sidebar accent |
| `--primary-foreground` | `#FFFFFF` | Text on primary buttons |
| `--destructive` | `#DC2626` | Error messages, logout text, required field indicators |
| `--accent` | `#F07060` | Button hover state, soft highlights |

**Sidebar Colors:**

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--sidebar-bg` | `#FFFFFF` | `#141620` | Sidebar background |
| `--sidebar-text` | `#374151` | `#D1D5DB` | Sidebar menu item text |
| `--sidebar-active-bg` | `#FFF5F4` | `#2A1F1E` | Active menu item background tint |
| `--sidebar-active-text` | `#E8604C` | `#F07060` | Active menu item text (coral) |
| `--sidebar-active-border` | `#E8604C` | `#F07060` | Active item left border (coral) |

**Dashboard Stat Card Colors:**

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--stat-card-bg` | `#FFFFFF` | `#1A1D2B` | Stat card background |
| `--stat-card-icon-bg` | `#FEE2E2` | `#3B1F1F` | Red circle behind stat icon |
| `--stat-card-value` | `#112337` | `#F9FAFB` | Large number text |
| `--stat-card-label` | `#6B7280` | `#9CA3AF` | Label text below number |

**Table Colors:**

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--table-header-bg` | `#F9FAFB` | `#1E2130` | Table header row background |
| `--table-row-bg` | `#FFFFFF` | `#1A1D2B` | Table body row background |
| `--table-row-hover` | `#F5F6F8` | `#252836` | Row hover state |
| `--table-border` | `#E5E7EB` | `#2D3348` | Row separator lines |

**FAQ Section (Forgot Password page):**

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--faq-bg` | `#204CE5` | `#1A2F6E` | Blue FAQ section background |
| `--faq-text` | `#FFFFFF` | `#E0E6FF` | FAQ text on blue background |

### 14.4 Page-by-Page Theme Behavior

#### Login Page (`/login`)

| Element | Light Mode | Dark Mode |
|---|---|---|
| Page background | White (`#FFFFFF`) | Near-black (`#0F1117`) |
| `lab2000.` logo | Dark text | White/light text |
| Login card | White with subtle shadow | Dark card (`#1A1D2B`) with subtle dark shadow |
| Input fields | Light gray background (`#F5F6F8`) | Dark muted background (`#252836`), light text |
| "Welcome back!" text | Dark text (`#112337`) | Light text (`#E8ECF1`) |
| Login button | Coral (`#E8604C`) — same both modes | Coral (`#E8604C`) — same both modes |
| "Forget Password?" link | Coral text | Coral text (slightly brighter in dark: `#F07060`) |
| Red accent divider | `#E8604C` | `#E8604C` (unchanged) |
| Skeleton illustration (right) | Light gray skeleton shapes | Dark gray skeleton shapes on dark card |

#### Registration Page (`/registration`)

| Element | Light Mode | Dark Mode |
|---|---|---|
| Page background | White | Near-black (`#0F1117`) |
| Header bar | White bg, dark logo | Dark bg (`#141620`), light logo |
| "Lab2000 Login" button | Coral outline pill | Coral outline pill (same) |
| Heading text | Dark serif text | Light serif text |
| Privacy notice text | Dark gray body text | Light gray body text |
| Form inputs | Light gray bg | Dark muted bg, light text |
| Submit button | Full-width coral | Full-width coral (same) |
| Photo area (silhouette) | Dark gray silhouette on white | Light gray silhouette on dark card |
| Photo area (matched photo) | B&W photo, white border | B&W photo, dark border with subtle glow |

#### Dashboard (`/user-dashboard`)

| Element | Light Mode | Dark Mode |
|---|---|---|
| Sidebar | White bg, dark text | Dark bg (`#141620`), light text |
| Active sidebar item | Coral text + left border, light pink bg | Coral text + left border, dark reddish bg |
| Top bar | White bg | Dark bg (`#1A1D2B`) |
| Main content area | Light gray bg (`#F9FAFB`) | Near-black bg (`#0F1117`) |
| Stat cards | White cards, dark numbers | Dark cards (`#1A1D2B`), light numbers |
| Stat icon circles | Light red bg (`#FEE2E2`) | Dark red bg (`#3B1F1F`) |
| Alumni table | White rows, light gray header | Dark rows, darker header |
| Table hover | Light gray hover | Slightly lighter dark hover |
| "Latest Urgent Requests" sidebar | White card | Dark card |

#### Slide-Out Panels (Professional Notices, Urgent Requests)

| Element | Light Mode | Dark Mode |
|---|---|---|
| Panel overlay | Semi-transparent black (`rgba(0,0,0,0.3)`) | Semi-transparent black (`rgba(0,0,0,0.5)`) |
| Panel background | White | Dark card (`#1A1D2B`) |
| Panel header | Dark text, close (X) button | Light text, close (X) button |
| WYSIWYG editor | White editor bg, dark toolbar | Dark editor bg (`#252836`), dark toolbar |
| Submit button | Coral | Coral (same) |

#### Account Settings (`/account-settings`)

| Element | Light Mode | Dark Mode |
|---|---|---|
| Tab bar | Light bg, coral active tab text | Dark bg, coral active tab text |
| Form sections | White bg | Dark card bg |
| Input fields | Light gray bg | Dark muted bg |
| "Current Photo" image | White border | Dark border |
| Dynamic tables (Employment, Services) | White rows | Dark rows |
| Social link inputs | Light bg with URL placeholder | Dark bg with URL placeholder |
| Update button | Coral | Coral (same) |

### 14.5 Technical Implementation

**Root Layout (`app/layout.tsx`):**

```tsx
// next-themes ThemeProvider wraps the entire application
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"         // adds "dark" class to <html>
          defaultTheme="light"      // Light Mode is the default
          enableSystem={true}       // respects OS prefers-color-scheme
          storageKey="lab2000-theme" // localStorage key
          disableTransitionOnChange={false} // smooth transitions
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Theme Toggle Component:**

```tsx
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button"; // ShadCN

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

**CSS Custom Properties (`globals.scss`):**

```scss
:root {
  // Light Mode (default)
  --background: 0 0% 100%;           // #FFFFFF
  --foreground: 210 33% 15%;         // #112337
  --card: 0 0% 100%;
  --card-foreground: 210 33% 15%;
  --muted: 220 14% 96%;              // #F5F6F8
  --muted-foreground: 220 9% 46%;    // #6B7280
  --border: 220 13% 91%;             // #E5E7EB
  --input: 220 14% 96%;
  --primary: 7 75% 60%;              // #E8604C
  --primary-foreground: 0 0% 100%;
  --sidebar-bg: 0 0% 100%;
  --sidebar-active-bg: 0 80% 97%;
}

.dark {
  // Dark Mode
  --background: 225 25% 7%;          // #0F1117
  --foreground: 216 25% 93%;         // #E8ECF1
  --card: 228 22% 13%;               // #1A1D2B
  --card-foreground: 216 25% 93%;
  --muted: 228 18% 18%;              // #252836
  --muted-foreground: 220 9% 63%;    // #9CA3AF
  --border: 226 20% 22%;             // #2D3348
  --input: 228 18% 18%;
  --primary: 7 75% 60%;              // #E8604C (unchanged)
  --primary-foreground: 0 0% 100%;
  --sidebar-bg: 230 25% 10%;
  --sidebar-active-bg: 5 30% 14%;
}
```

**Tailwind Usage Pattern:**

```html
<!-- Example: Dashboard stat card -->
<div class="bg-card text-card-foreground border border-border rounded-lg p-6
            dark:shadow-lg dark:shadow-black/20">
  <div class="flex items-center gap-4">
    <div class="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
      <UsersIcon class="text-red-500" />
    </div>
    <div>
      <p class="text-3xl font-bold text-foreground">261</p>
      <p class="text-sm text-muted-foreground">Total Members</p>
    </div>
  </div>
</div>
```

### 14.6 Theme Persistence & Sync

```
FIRST VISIT (unauthenticated)
    │
    ├── No localStorage key found
    ├── next-themes checks OS preference (prefers-color-scheme)
    ├── If OS has no preference → defaults to LIGHT MODE
    └── Renders page in Light Mode
         │
         ▼
USER TOGGLES THEME
    │
    ├── next-themes updates <html class="dark"> or removes it
    ├── Saves to localStorage: lab2000-theme = "dark"
    ├── CSS transitions animate all color changes (200ms)
    └── All pages immediately reflect the new theme
         │
         ▼
USER LOGS IN
    │
    ├── Theme from localStorage is preserved (no reset)
    ├── Optionally: POST /api/user-preferences { theme: "dark" }
    │   → Saves to user_preferences table for cross-device sync
    └── On next login from a different device:
        → Fetch GET /api/user-preferences
        → Apply saved theme preference
         │
         ▼
USER LOGS OUT
    │
    ├── localStorage theme key is PRESERVED (not cleared)
    └── User sees the same theme on the login page
```

### 14.7 Email Template Theme

Email notifications are **always sent in Light Mode** styling regardless of the user's dashboard theme preference. This ensures maximum readability across all email clients.

```
┌─────────────────────────────────────┐
│           lab2000.                    │  ← Always light bg
│─────────────────────────────────────│  ← Always dark text
│                                     │
│  Hi [Recipient Name],              │
│  [Notification body]                │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     View on Dashboard    ↗   │  │  ← Coral button (always)
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 15. Responsive Design — 100% Responsiveness

### 15.1 Overview

The application is built with a **mobile-first, 100% responsive** approach. Every page, layout, component, and interaction must work flawlessly across all device sizes. There are no desktop-only features — the full functionality of the platform is accessible on a 320px mobile screen.

| Requirement | Standard |
|---|---|
| **Methodology** | Mobile-first using Tailwind CSS breakpoint prefixes |
| **Minimum supported width** | 320px (iPhone SE / small Android) |
| **Target breakpoints** | 4 breakpoints: `sm`, `md`, `lg`, `xl` (see 15.2) |
| **Testing mandate** | Every page tested at 320px, 375px, 768px, 1024px, 1440px, 1920px |
| **No horizontal scrolling** | No page may produce a horizontal scrollbar at any breakpoint |
| **Touch targets** | All interactive elements minimum 44x44px on mobile (WCAG 2.5.5) |
| **Orientation** | Both portrait and landscape supported |

### 15.2 Breakpoint System

The project uses Tailwind CSS breakpoints. All styling is written **mobile-first** — the base class applies to mobile, and breakpoint prefixes override for larger screens.

| Breakpoint | Prefix | Min Width | Target Devices |
|---|---|---|---|
| Base (default) | — | `0px` | Mobile phones (320px–639px) |
| Small | `sm:` | `640px` | Large phones / small tablets |
| Medium | `md:` | `768px` | Tablets (portrait iPad, etc.) |
| Large | `lg:` | `1024px` | Laptops, tablets (landscape) |
| Extra Large | `xl:` | `1280px` | Desktops |
| 2XL | `2xl:` | `1536px` | Large desktops / ultrawide |

### 15.3 Page-by-Page Responsive Behavior

#### Login Page (`/login`)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Single column — only login form visible. Skeleton illustration hidden. Full-width card. Logo above card. Theme toggle top-right corner. |
| **Tablet (768px–1023px)** | Single column — form centered with more padding. Skeleton illustration partially visible or reduced. |
| **Desktop (1024px+)** | Two-column layout (form left, skeleton right, red divider between) as shown in screenshots. |

```
MOBILE                    TABLET                   DESKTOP
┌─────────────┐           ┌──────────────────┐     ┌────────────┬──────────┐
│  lab2000.   │           │    lab2000.       │     │ Form       │█ Skeleton│
│  [☀/🌙]    │           │    [☀/🌙]        │     │            │█         │
│             │           │                  │     │ Email      │█ ┌──┐   │
│ Welcome! 👋 │           │  Welcome! 👋      │     │ Password   │█ │  │   │
│             │           │                  │     │ [Login ↗]  │█ └──┘   │
│ Email *     │           │  Email *          │     │ Forgot?    │█        │
│ [________]  │           │  [____________]   │     │            │         │
│ Password *  │           │  Password *       │     └────────────┴──────────┘
│ [________]  │           │  [____________]   │
│ [Login ↗ ]  │           │  [  Login ↗  ]    │
│ Forgot?     │           │  Forgot?          │
└─────────────┘           └──────────────────┘
```

#### Registration Page (`/registration`)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Single column — privacy notice stacks above the form. Form fields stack to full-width single column. Photo preview below form. |
| **Tablet (768px–1023px)** | Form fields in 2-column grid (First Name / Last Name side-by-side). Privacy notice above or in a collapsible section. |
| **Desktop (1024px+)** | Two-column layout (privacy text left, form right) as shown in screenshot. |

```
MOBILE                           DESKTOP
┌───────────────────┐            ┌──────────────┬─────────────┐
│ Laboratorians...  │            │ Laboratorians│ First  Last │
│ students can only │            │ batch 2000   │ [___] [___] │
│ register here     │            │ students can │             │
│                   │            │ only register│ Section Roll│
│ Privacy notice... │            │ here         │ [___] [___] │
│                   │            │              │             │
│ First Name *      │            │ Privacy text │ Email Phone │
│ [______________]  │            │ ...          │ [___] [___] │
│ Last Name *       │            │              │             │
│ [______________]  │            │              │ Password    │
│ Section * Roll    │            │              │ [_________] │
│ [______] [____]   │            │              │             │
│ Email *           │            │              │ [  Submit ] │
│ [______________]  │            │              │             │
│ Phone *           │            │              │ Old photo?  │
│ [______________]  │            │              │   [photo]   │
│ Password *        │            └──────────────┴─────────────┘
│ [______________]  │
│ [    Submit     ] │
│ Old photo? [img]  │
└───────────────────┘
```

#### Forgot Password Page (`/lost-password`)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Centered single-column form with full-width button. FAQ section stacks below. |
| **Desktop (1024px+)** | Centered narrow-width form (max-w-md). Blue FAQ section full-width below. |

#### Dashboard (`/user-dashboard`)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Sidebar hidden — accessible via hamburger menu overlay. Stat cards stack vertically (1 column). Alumni table scrolls horizontally. "Latest Urgent Requests" sidebar moves below the table. |
| **Tablet (768px–1023px)** | Sidebar collapsed to icons only (no labels). Stat cards in 2x2 grid. Alumni table full width. Urgent sidebar below table. |
| **Desktop (1024px+)** | Full sidebar with labels. 4 stat cards in a row. Alumni table with urgent sidebar to the right. As shown in screenshot. |

```
MOBILE                         TABLET                        DESKTOP
┌────────────────┐             ┌──┬───────────────────┐      ┌────────┬───────────────────┐
│ [≡] lab2000 [▾]│             │🏠│ Welcome back 👋    │      │ Dashb. │ Welcome back 👋    │
├────────────────┤             │👥│                   │      │ Friends│                   │
│ Welcome 👋     │             │📋│ ┌────┐ ┌────┐     │      │ Profes.│ ┌──┐┌──┐┌──┐┌──┐ │
│                │             │🚨│ │261 │ │ 31 │     │      │ Urgent │ │  ││  ││  ││  │ │
│ ┌──────────┐   │             │⚙│ └────┘ └────┘     │      │ Acct.  │ └──┘└──┘└──┘└──┘ │
│ │  261     │   │             │  │ ┌────┐ ┌────┐     │      │ Home   │                   │
│ │ Members  │   │             │  │ │ 0  │ │ 0  │     │      │        │ Alumni    │Urgent │
│ └──────────┘   │             │  │ └────┘ └────┘     │      │        │ Table     │Sidebar│
│ ┌──────────┐   │             │  │                   │      │        │           │       │
│ │  31      │   │             │  │ Alumni Table      │      │        │           │       │
│ │ Active   │   │             │  │ (full width)      │      └────────┴───────────┴───────┘
│ └──────────┘   │             │  │                   │
│ ┌──────────┐   │             │  │ Urgent Requests   │
│ │  0       │   │             │  │ (below table)     │
│ │ Profess. │   │             └──┴───────────────────┘
│ └──────────┘   │
│ ┌──────────┐   │
│ │  0       │   │
│ │ Urgent   │   │
│ └──────────┘   │
│                │
│ Alumni Table   │
│ (scrollable →) │
│                │
│ Urgent Requests│
│ (below)        │
└────────────────┘
```

#### Members Directory — My Friends (`/members`)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 640px)** | Search bar stacks vertically (search input full-width, filters below). Photo grid: 2 columns. |
| **Small (640px–767px)** | Search bar partially inline. Photo grid: 3 columns. |
| **Tablet (768px–1023px)** | Search bar fully inline. Photo grid: 4 columns. |
| **Desktop (1024px+)** | Full filter bar in one row. Photo grid: 6 columns. As shown in screenshot. |

```
MOBILE (2-col)     TABLET (4-col)        DESKTOP (6-col)
┌─────┬─────┐      ┌───┬───┬───┬───┐     ┌──┬──┬──┬──┬──┬──┐
│ 📷  │ 📷  │      │ 📷│ 📷│ 📷│ 📷│     │📷│📷│📷│📷│📷│📷│
│name │name │      │   │   │   │   │     │  │  │  │  │  │  │
├─────┼─────┤      ├───┼───┼───┼───┤     ├──┼──┼──┼──┼──┼──┤
│ 📷  │ 📷  │      │ 📷│ 📷│ 📷│ 📷│     │📷│📷│📷│📷│📷│📷│
│name │name │      │   │   │   │   │     │  │  │  │  │  │  │
└─────┴─────┘      └───┴───┴───┴───┘     └──┴──┴──┴──┴──┴──┘
```

#### Professional Notices & Urgent Requests (Slide-Out Panels)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Slide-out panel becomes **full-screen overlay** (100vw, 100vh). Close button prominent at top. All fields stack vertically. WYSIWYG editor full-width. |
| **Tablet (768px–1023px)** | Slide-out panel takes ~70% width from right. |
| **Desktop (1024px+)** | Slide-out panel takes ~40–50% width from right. As shown in screenshots. |

#### Account Settings (`/account-settings`)

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Tabs become a horizontal scrollable bar or vertical accordion. Form fields stack to single column. Previous Employment table scrolls horizontally. Social links stack vertically. |
| **Tablet (768px–1023px)** | Tabs horizontal. Form fields in 2-column grid where appropriate. |
| **Desktop (1024px+)** | Tabs horizontal. Form fields in 3-column grid (e.g., Nick Name / School House / Blood Group). As shown in screenshot. |

#### Image Verification Confirmation Dialog

| Breakpoint | Layout |
|---|---|
| **Mobile (< 768px)** | Full-screen modal. Photo centered. "Yes" and "No" buttons stacked vertically, full-width. |
| **Desktop (1024px+)** | Centered modal (max-w-md). Photo above buttons. "Yes" and "No" side-by-side. |

### 15.4 Responsive Sidebar Navigation

The dashboard sidebar transforms across breakpoints:

| Breakpoint | Sidebar Behavior |
|---|---|
| **Mobile (< 768px)** | Sidebar completely hidden. Hamburger menu icon `[≡]` in top bar. Tapping opens a full-height overlay drawer (slides in from left) with backdrop. Closes on menu item tap or backdrop tap. |
| **Tablet (768px–1023px)** | Sidebar collapsed to **icon-only mode** (narrow, ~60px). Hovering/clicking shows tooltip with label. Expands to full width on toggle. |
| **Desktop (1024px+)** | Sidebar fully expanded with icons + labels. Collapsible via toggle icon (persists state in localStorage). |

```
MOBILE (drawer)              TABLET (icon-only)       DESKTOP (full)
┌──────────────┬──────┐      ┌──┬──────────────┐      ┌──────────┬───────────┐
│ lab2000.  ✕  │░░░░░░│      │🏠│              │      │ 🏠 Dash. │           │
│──────────────│░░░░░░│      │👥│              │      │ 👥 Friend│           │
│ 🏠 Dashboard │░░░░░░│      │📋│  Content     │      │ 📋 Prof. │  Content  │
│ 👥 My Friends│░back-│      │🚨│  Area        │      │ 🚨 Urgent│  Area     │
│ 📋 Prof. Not.│░drop │      │⚙│              │      │ ⚙ Acct. │           │
│ 🚨 Urgent    │░░░░░░│      │🏡│              │      │ 🏡 Home  │           │
│ ⚙ Account   │░░░░░░│      └──┴──────────────┘      └──────────┴───────────┘
│ 🏡 Home      │░░░░░░│
└──────────────┴──────┘
```

### 15.5 Responsive Tables

All data tables (Alumni table on dashboard, employment history, business services) follow this responsive strategy:

| Breakpoint | Strategy |
|---|---|
| **Mobile (< 768px)** | **Card layout** — each table row becomes a stacked card with label-value pairs. Or: horizontal scroll with sticky first column. |
| **Desktop (768px+)** | Standard horizontal table with full columns visible. |

**Example — Alumni Table on Mobile (card layout):**

```
┌─────────────────────────┐
│ 👤 G.S. Badruddin Ahmed │
│    b.ahmed@traderay.net  │
│ ─────────────────────── │
│ Section:    D            │
│ Number:     —            │
│ Blood:      A+           │
└─────────────────────────┘
┌─────────────────────────┐
│ 👤 Monzur Al Murshed    │
│    monzural@gmail.com    │
│ ─────────────────────── │
│ Section:    D            │
│ Number:     01714120033  │
│ Blood:      B+           │
└─────────────────────────┘
```

### 15.6 Responsive Forms

All forms follow a consistent responsive grid system:

| Breakpoint | Grid Columns | Example |
|---|---|---|
| **Mobile (< 640px)** | 1 column | Every field stacks full-width |
| **Small (640px–767px)** | 1–2 columns | Short fields side-by-side (First/Last Name) |
| **Tablet (768px–1023px)** | 2 columns | Most field pairs side-by-side |
| **Desktop (1024px+)** | 2–3 columns | As shown in screenshots (3-col for Account Settings) |

**Tailwind Implementation Pattern:**

```html
<!-- Responsive form grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <div> <!-- Field 1: Full-width on mobile, 1/2 on sm, 1/3 on lg --> </div>
  <div> <!-- Field 2 --> </div>
  <div> <!-- Field 3 --> </div>
</div>
```

### 15.7 Responsive Typography

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Page heading (H1) | `text-xl` (20px) | `text-2xl` (24px) | `text-3xl` (30px) |
| Section heading (H2) | `text-lg` (18px) | `text-xl` (20px) | `text-2xl` (24px) |
| Stat card number | `text-2xl` (24px) | `text-3xl` (30px) | `text-4xl` (36px) |
| Stat card label | `text-xs` (12px) | `text-sm` (14px) | `text-sm` (14px) |
| Body text | `text-sm` (14px) | `text-base` (16px) | `text-base` (16px) |
| Table text | `text-xs` (12px) | `text-sm` (14px) | `text-sm` (14px) |

### 15.8 Responsive Testing Checklist

Every page must pass all checks at every breakpoint before deployment:

| # | Check | Breakpoints |
|---|---|---|
| 1 | No horizontal scrollbar appears | All |
| 2 | All text is readable without zooming | All |
| 3 | All buttons/links have min 44x44px touch target | Mobile, Tablet |
| 4 | Forms are fully usable (all fields visible, submittable) | All |
| 5 | Navigation is accessible (hamburger on mobile, sidebar on desktop) | All |
| 6 | Images scale properly (no overflow, no distortion) | All |
| 7 | Modals/slide-outs don't overflow viewport | All |
| 8 | Tables are readable (card layout or horizontal scroll) | Mobile |
| 9 | Theme toggle is accessible and visible | All |
| 10 | Stat cards don't overlap or truncate | All |
| 11 | Photo grid columns adjust correctly | All |
| 12 | WYSIWYG editor toolbar is usable | Mobile, Tablet |
| 13 | User dropdown menu doesn't overflow screen | Mobile |
| 14 | File upload buttons are tappable | Mobile |
| 15 | Portrait AND landscape orientation work | Mobile, Tablet |

---

## 16. Data Validation & Matching Logic

### 16.1 Registration Image Verification — Matching Algorithm

```php
// Laravel: AlumniVerificationService.php (Pseudocode)

public function verifyAlumni(string $firstName, string $lastName, string $section, ?int $rollNumber): ?AlumniRecord
{
    $query = AlumniRecord::query()
        ->whereRaw('LOWER(first_name) = ?', [strtolower(trim($firstName))])
        ->whereRaw('LOWER(last_name) = ?', [strtolower(trim($lastName))])
        ->where('section', strtoupper($section));

    if ($rollNumber) {
        $query->where('roll_number', $rollNumber);
    }

    $record = $query->first();

    if (!$record) {
        // Attempt fuzzy match: SOUNDEX or LIKE with tolerance
        $record = AlumniRecord::query()
            ->whereRaw('SOUNDEX(first_name) = SOUNDEX(?)', [$firstName])
            ->whereRaw('SOUNDEX(last_name) = SOUNDEX(?)', [$lastName])
            ->where('section', strtoupper($section))
            ->first();
    }

    return $record;
}
```

### 15.2 Validation Rules

**Registration Form — Laravel Validation:**

| Field | Rules |
|---|---|
| `first_name` | `required`, `string`, `min:2`, `max:100` |
| `last_name` | `required`, `string`, `min:2`, `max:100` |
| `section` | `required`, `in:A,B,C,D` |
| `roll_number` | `nullable`, `integer`, `min:1`, `max:71` |
| `email` | `required`, `email`, `unique:users,email` |
| `phone` | `required`, `string`, `regex:/^\+?[0-9]{10,15}$/` |
| `password` | `required`, `string`, `min:8`, `confirmed` |
| `alumni_record_id` | `nullable`, `exists:alumni_records,id` |
| `image_confirmed` | `boolean` |

**Login Form:**

| Field | Rules |
|---|---|
| `email` | `required`, `email` |
| `password` | `required`, `string` |

**Urgent Request Form:**

| Field | Rules |
|---|---|
| `title` | `required`, `string`, `max:255` |
| `type_of_emergency` | `required`, `string` |
| `date_of_incident` | `nullable`, `date`, `format:Y-m-d` |
| `location` | `nullable`, `string`, `max:255` |
| `urgency_level` | `nullable`, `in:immediate,high,medium,low` |
| `contact_person` | `nullable`, `string`, `max:100` |
| `contact_number` | `nullable`, `string`, `max:20` |
| `description` | `required`, `string` |
| `attachment` | `nullable`, `file`, `max:65536` (64 MB) |

---

## 16. Error Handling

### 16.1 Registration Errors

| Scenario | Error Message | UI Behavior |
|---|---|---|
| No matching alumni record | "No matching alumni record found. Please verify your name, section, and roll number." | Silhouette remains; form still submittable but flagged |
| Alumni already registered | "This alumni record has already been registered. Please log in instead." | Submit button disabled; link to login shown |
| Email already taken | "This email address is already in use." | Inline error below email field |
| Weak password | "Password must be at least 8 characters with mixed case and numbers." | Inline error below password field |
| Image confirmation declined | "You declined the photo. Please re-check your name and section, or continue without verification." | Photo resets; form remains usable |
| Network error during lookup | "Unable to verify identity. Please check your connection and try again." | Retry button appears in photo area |

### 16.2 Login Errors

| Scenario | Error Message | UI Behavior |
|---|---|---|
| Invalid credentials | "Invalid email or password." | Inline error below form |
| Account not activated | "Your account is pending activation." | Message with admin contact info |
| Too many attempts | "Too many login attempts. Please try again in 60 seconds." | Form disabled with countdown |

### 16.3 Notification Errors

| Scenario | Handling |
|---|---|
| Email delivery failure | Job retried 3 times via Laravel queue; logged to `failed_jobs` table; admin alerted |
| WebSocket connection lost | Next.js client auto-reconnects with exponential backoff; falls back to polling `/api/notifications` every 30 seconds |
| Invalid notification settings | Default settings applied; user prompted to review preferences |
| Queue worker down | Supervisor/systemd restarts worker; unprocessed jobs remain in queue |

---

## 17. Security & Privacy Considerations

### 17.1 Authentication & Authorization

| Measure | Implementation |
|---|---|
| Token authentication | Laravel Sanctum SPA tokens with CSRF protection |
| Password hashing | bcrypt with cost factor 12 |
| Session timeout | Auto-logout after 30 minutes of inactivity |
| Rate limiting | 5 login attempts per minute per IP (Laravel throttle middleware) |
| CSRF protection | Laravel CSRF token verification on all POST/PUT/DELETE requests |
| Route guards | Next.js middleware checks auth state; Laravel middleware validates tokens |

### 17.2 Data Privacy

| Measure | Implementation |
|---|---|
| Member-only access | All profile data, directory, and contact information visible only to authenticated members |
| Alumni photo protection | School photographs served via signed URLs with 1-hour expiration |
| Input sanitization | All user inputs sanitized against XSS; WYSIWYG content stripped of script tags |
| File upload validation | MIME type checking, file extension whitelist, virus scanning |
| GDPR-style privacy | Privacy notice on registration; data accessible only to verified batchmates |
| Sensitive data encryption | Passwords hashed; tokens encrypted at rest |

### 17.3 Image Verification Security

| Threat | Mitigation |
|---|---|
| Brute-force alumni lookup | Rate limit: max 10 lookup requests per minute per IP |
| Photo URL enumeration | Signed URLs with expiry; sequential IDs not exposed |
| Impersonation (claiming wrong identity) | Photo confirmation required; admin review flag if image not confirmed |
| Re-registration attack | `is_registered` flag prevents duplicate; unique email constraint |

---

## 18. Performance Considerations

| Area | Optimization |
|---|---|
| **Alumni photo lookup** | Database query indexed on `(first_name, last_name, section, roll_number)`; response cached for 5 minutes per unique combination |
| **School photo delivery** | Images compressed to WebP; CDN-cached; lazy-loaded on registration page |
| **Member directory grid** | Paginated API (24 per page); lazy-loaded images; skeleton placeholders while loading |
| **Notification dispatch** | Queued via Laravel Horizon/Redis; batch processing to avoid N+1 email sends |
| **Real-time notifications** | WebSocket connection pooling; reconnection with exponential backoff |
| **Dashboard statistics** | Cached counters (Redis) refreshed every 5 minutes; not queried on every page load |
| **Email delivery** | Queue workers process emails asynchronously; retry with backoff; dead letter queue for persistent failures |
| **Frontend rendering** | Next.js SSR for initial load; client-side navigation for subsequent pages; code-splitting per route |
| **Database queries** | Eloquent eager loading to prevent N+1; indexed foreign keys; query result caching |
| **Theme switching** | CSS custom properties enable instant theme change with zero re-render; `next-themes` prevents FOUC (flash of unstyled content) via `<script>` injected before paint; no additional API calls on toggle (localStorage only); server-synced preference fetched once on login |

---

## 19. Development Task Plan

### Phase 1: Foundation — HIGH Priority

| # | Task | Description | Priority |
|---|---|---|---|
| 1.1 | **Laravel Project Setup** | Initialize Laravel project, configure Sanctum, MySQL, mail, queue drivers | HIGH |
| 1.2 | **Next.js Project Setup** | Initialize Next.js with TypeScript, configure Tailwind, SCSS, ShadCN UI, install and configure `next-themes` with `defaultTheme="light"` | HIGH |
| 1.3 | **Database Migration & Seeding** | Create all migrations (`alumni_records`, `users`, `notifications`, `notification_settings`, `urgent_requests`, `professional_notices`); seed 261 alumni records with photos | HIGH |
| 1.4 | **Login Page** | Build login UI matching screenshot; integrate with Sanctum auth; implement error states | HIGH |
| 1.5 | **Registration with Image Verification** | Build registration form matching screenshot; implement AJAX alumni lookup API; build photo display + confirmation dialog; implement full registration flow | HIGH |
| 1.6 | **Forgot/Reset Password** | Build lost password + reset password pages matching screenshots; integrate Laravel password reset | HIGH |
| 1.7 | **Dashboard Layout** | Build authenticated layout (sidebar, top bar, user dropdown); implement dashboard overview with stat cards, alumni table, urgent requests sidebar | HIGH |
| 1.8 | **Dark/Light Theme System** | Implement `ThemeProvider` wrapper; create theme toggle component (Sun/Moon icon); define all CSS custom properties for light and dark tokens in `globals.scss`; add `dark:` Tailwind variants to all components; ensure every page renders correctly in both modes; default to Light Mode | HIGH |

### Phase 2: Core Features — HIGH Priority

| # | Task | Description | Priority |
|---|---|---|---|
| 2.1 | **Members Directory** | Build photo grid with search, blood group filter, section filter, active toggle; paginated API | HIGH |
| 2.2 | **Account Settings — My Profile** | Build 3-tab interface; implement all 25+ profile fields; dynamic employment table; business services toggle; social links; photo upload | HIGH |
| 2.3 | **Account Settings — Password** | Build password change tab with current + new + confirm fields | HIGH |
| 2.4 | **Member Profile View** | Build read-only member profile page accessible from directory | HIGH |

### Phase 3: Communication Features — MEDIUM Priority

| # | Task | Description | Priority |
|---|---|---|---|
| 3.1 | **Urgent Requests Module** | Build list view + slide-out entry form; implement all fields; file upload; status lifecycle | MEDIUM |
| 3.2 | **Professional Notices Module** | Build list view + slide-out entry form; implement requirement fields; WYSIWYG; file upload | MEDIUM |
| 3.3 | **Notification System — Email** | Implement Laravel events + listeners for login/registration/urgent; branded email templates; queue processing | MEDIUM |
| 3.4 | **Notification System — In-App** | Implement notification bell in top bar; real-time WebSocket delivery; notification dropdown panel; unread count badge | MEDIUM |
| 3.5 | **Notification Settings UI** | Build per-user preferences page; 6 toggles (email/in-app per event); save via API; apply defaults on registration | MEDIUM |

### Phase 4: Polish & Optimization — MEDIUM Priority

| # | Task | Description | Priority |
|---|---|---|---|
| 4.1 | **Mobile Responsiveness** | Test and fix all pages on mobile; collapsible sidebar; stacked stat cards; responsive photo grid; mobile-friendly slide-out panels | MEDIUM |
| 4.2 | **Content Typo Fixes** | Fix "Registered Alumnies" → "Alumni"; "Total Professional connection" → "Connections"; "Forget Password" → "Forgot Password"; lost password grammar fix | MEDIUM |
| 4.3 | **Design System Consistency** | Standardize coral/salmon button colors; consistent input styling between pages; consistent empty states with icons; ensure premium, professional, and unique visual design quality across both light and dark themes with polished micro-interactions, refined typography, and distinctive brand identity | MEDIUM |
| 4.4 | **Loading & Skeleton States** | Add skeleton loaders for dashboard, directory, profile pages; loading spinners for form submissions; toast notifications for success/error | MEDIUM |

### Phase 5: Security & Infrastructure — LOW Priority

| # | Task | Description | Priority |
|---|---|---|---|
| 5.1 | **Security Hardening** | Rate limiting on all auth endpoints; CAPTCHA on registration; sanitize WYSIWYG input; validate file uploads; session timeout | LOW |
| 5.2 | **Performance Optimization** | Redis caching for stats/queries; image compression pipeline; CDN setup; database indexing audit; queue monitoring | LOW |
| 5.3 | **SEO & Accessibility** | Meta tags; Open Graph; ARIA labels on all form fields; keyboard navigation; color contrast audit | LOW |
| 5.4 | **Analytics & Monitoring** | Google Analytics or Plausible; error logging (Sentry); uptime monitoring; queue health checks | LOW |
| 5.5 | **Backup & Legal** | Automated database/file backups; privacy policy page; terms of service; cookie consent banner | LOW |

### Sprint Roadmap

```
Sprint 1 (Week 1–2)   → Phase 1: Foundation (Laravel + Next.js setup,
                         Login, Registration with Image Verification,
                         Forgot Password, Dashboard layout,
                         Dark/Light Theme System)

Sprint 2 (Week 3–4)   → Phase 2: Core Features (Members Directory,
                         Account Settings full build, Member Profile)

Sprint 3 (Week 5–6)   → Phase 3: Communication (Urgent Requests,
                         Professional Notices, Notification system
                         — email + in-app + settings UI)

Sprint 4 (Week 7–8)   → Phase 4: Polish (Mobile responsiveness,
                         design consistency, typo fixes, loading states)

Sprint 5 (Week 9–10)  → Phase 5: Security & Infrastructure
                         (Hardening, performance, SEO, backups)
```

---

## 20. Future Improvement Suggestions

| # | Feature | Description | Priority |
|---|---|---|---|
| 1 | **Member Activation Campaign** | Only 31 of 261 alumni are active (88% inactive). Implement email re-engagement campaign; profile completeness prompts; onboarding flow for new registrations. | HIGH |
| 2 | **Event Calendar & RSVP** | Dedicated events page with calendar view; RSVP functionality; attendee lists; event reminders via email. | MEDIUM |
| 3 | **Internal Messaging** | Direct messaging between members; inbox/sent/read receipts; WhatsApp click-to-chat integration on profiles. | MEDIUM |
| 4 | **Birthday System** | Add DOB field to profiles; dashboard "Today's Birthdays" widget; automated birthday greeting emails. | LOW |
| 5 | **Photo Gallery** | Shared event photo albums; photo tagging; digital yearbook with "Then & Now" comparison. | LOW |
| 6 | **Polls & Surveys** | Community voting for event planning (date, venue); feedback surveys. | LOW |
| 7 | **Progressive Web App** | PWA conversion for offline directory access; push notifications; "Add to Home Screen" prompt. | LOW |
| 8 | **Admin Panel** | Dedicated admin dashboard with site analytics; member management (approve/suspend); bulk email sender; content moderation for user-submitted entries. | LOW |
| 9 | **Two-Factor Authentication** | Optional 2FA via email/SMS OTP for enhanced account security. | LOW |
| 10 | **AI-Powered Name Matching** | Machine learning fuzzy matching for name variations (spelling differences, nicknames) during registration verification. | LOW |

---

## Appendix A: Screenshot Reference

| Screenshot File | Page Documented | Section |
|---|---|---|
| `login.png` | Login Page | Section 6.1 |
| `registration.png` | Registration Page | Section 7.2 |
| `forgotpassword.png` | Forgot Password Page | Section 6.2 |
| `dashboard.png` | User Dashboard | Section 8 |
| `memebers.png` | Members Directory (My Friends) | Section 9 |
| `professional-connection.png` | Professional Notices | Section 10 |
| `urgent-request.png` | Urgent Requests | Section 11 |
| `account-settings.png` | Account Settings — My Profile (full) | Section 12.2 |
| `account-setting.png` | Account Settings — My Profile (top) | Section 12.2 |
| `password.png` | Account Settings — Password Tab | Section 12.4 |
| `user-prorile-menu.png` | User Dropdown Menu + Password Tab | Section 8.2 |

---

## Appendix B: API Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/login` | No | Authenticate user, return Sanctum token |
| `POST` | `/api/logout` | Yes | Invalidate current session |
| `POST` | `/api/register` | No | Register new user with image verification |
| `GET` | `/api/alumni/verify` | No | Lookup alumni record by name+section+roll |
| `POST` | `/api/forgot-password` | No | Request password reset email |
| `POST` | `/api/reset-password` | No | Reset password with token |
| `GET` | `/api/dashboard/stats` | Yes | Dashboard statistics (member counts) |
| `GET` | `/api/members` | Yes | Paginated member directory |
| `GET` | `/api/members/{id}` | Yes | Single member profile |
| `GET` | `/api/profile` | Yes | Current user profile |
| `PUT` | `/api/profile` | Yes | Update current user profile |
| `PUT` | `/api/password` | Yes | Change password |
| `GET` | `/api/urgent-requests` | Yes | List urgent requests |
| `POST` | `/api/urgent-requests` | Yes | Submit new urgent request |
| `GET` | `/api/professional-notices` | Yes | List professional notices |
| `POST` | `/api/professional-notices` | Yes | Submit new professional notice |
| `GET` | `/api/notifications` | Yes | List user notifications |
| `PUT` | `/api/notifications/{id}/read` | Yes | Mark notification as read |
| `GET` | `/api/notification-settings` | Yes | Get user notification preferences |
| `PUT` | `/api/notification-settings` | Yes | Update notification preferences |
| `GET` | `/api/user-preferences` | Yes | Get user preferences (theme, etc.) |
| `PUT` | `/api/user-preferences` | Yes | Update user preferences (theme sync across devices) |

---

*Document Version: 2.1*
*Generated: March 1, 2026*
*Based on: 11 authenticated screenshots + system requirements specification*
*Technology: Laravel (Backend) + Next.js (Frontend) + SCSS + Tailwind CSS + ShadCN UI + next-themes*
*Theme: Dark Mode & Light Mode (Light default) — Premium, Professional, Unique Design*
*Classification: Internal — Developers & Project Stakeholders*
