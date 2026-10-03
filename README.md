# Mini Customer Management App

A modern customer management web app where users can add, view, edit, delete and search customers. Built as the Day 1 practical task for MERN / Web Development.

## Live Demo
- Working application: _add your Vercel link here_
- GitHub repository: _add your repository link here_

## Technologies Used
- **Next.js** (App Router) - React framework
- **TypeScript** - type safety
- **Supabase** (PostgreSQL) - database and API
- **@supabase/supabase-js** - Supabase client library
- **lucide-react** - icons
- **Plain CSS** - custom dark glass-style UI (no UI library)
- **Vercel** - deployment

## Features
- **Add Customer** in a modal form
- **View Customer List** in a table with avatars, phone, email and city
- **Edit Customer** in a modal pre-filled with the existing data
- **Delete Customer** with a confirmation modal
- **Search Customer** by name, phone, email or city; multiple words are supported, phone search ignores spaces and dashes, and matching text is highlighted
- **Form Validation**
  - Name: at least 2 characters
  - Phone: 7 to 15 characters (digits, +, - and spaces)
  - Email: valid email format
  - City: at least 2 characters
- **Toast notifications** on every action (add, update, delete, error)
- **Instant UI updates without page reload**: a new customer appears at the bottom of the list and is highlighted, edited rows update in place, and deleted rows slide out
- **Stats cards**: total customers, number of cities and the latest customer added
- **Fixed-height table** with a vertical scrollbar, sticky header and a custom styled scrollbar
- **Responsive design** for desktop, tablet and mobile
- Loading, empty and error states (with a "Try again" button)

### Day 3 Improvements
- **Better validation:** required fields, length limits, letters-only names and cities, 10 to 15 digit phone numbers, strict email format, and a unique email check (duplicate emails show a clear message)
- **Proper database queries:** all queries live in `lib/customers.ts`; the list uses server-side pagination, search (`ilike` on name, email, phone, city) and city filtering, with a 300ms debounce while typing
- **Pagination** (10 customers per page, newest first)
- **Filtering** by city using a dropdown
- **Customer details page** at `/customers/[id]` with clickable phone and email links
- **Error handling:** friendly database error messages, error screen with retry, and not-found state on the details page
- **Database indexes** on city and created_at for faster queries

## How to Run
1. Clone the repository and open the folder:
   ```bash
   git clone <your-repo-url>
   cd mini-customer-management-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a project on [supabase.com](https://supabase.com) and run the SQL from `supabase/schema.sql` in the **SQL Editor**.
4. Copy `.env.example` to `.env.local` and add your Supabase values (Project Settings -> API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000

To create a production build, run `npm run build` and then `npm start`.

## Project Structure
```
├── app/
│   ├── globals.css          # all styles
│   ├── layout.tsx           # root layout
│   ├── page.tsx             # main page (state + CRUD logic)
│   └── customers/[id]/page.tsx  # customer details page
├── components/
│   ├── Header.tsx
│   ├── StatsCards.tsx
│   ├── SearchBar.tsx
│   ├── Highlight.tsx        # highlights search matches
│   ├── CustomerTable.tsx
│   ├── Modal.tsx            # reusable modal wrapper
│   ├── CustomerFormModal.tsx
│   ├── DeleteModal.tsx
│   ├── Pagination.tsx
│   ├── ErrorState.tsx
│   └── ToastContainer.tsx
├── hooks/
│   ├── useToast.ts
│   └── useCustomers.ts      # fetches the list (pagination, search, filter)
├── lib/
│   ├── supabase.ts          # Supabase client and Customer type
│   ├── customers.ts         # all database queries
│   └── utils.ts             # validation, search matching, helpers
├── supabase/
│   ├── schema.sql           # database schema
│   └── day3_migration.sql   # unique email + indexes
└── .env.example
```

## Database Structure
Table: `customers`

| Column     | Type        | Notes                              |
|------------|-------------|------------------------------------|
| id         | uuid        | Primary key, auto generated        |
| name       | text        | Not null                           |
| phone      | text        | Not null                           |
| email      | text        | Not null                           |
| city       | text        | Not null                           |
| created_at | timestamptz | Defaults to the current time       |

The `email` column is unique, and indexes exist on `city` and `created_at` (see `supabase/day3_migration.sql`). Row Level Security (RLS) is enabled. For this practical task a public policy allows anyone with the anon key to read and write the table. A real production app should restrict this with authentication.

## What I Learned
- How to build a Next.js App Router project with TypeScript and split the UI into reusable components and hooks.
- How to connect to Supabase and perform full CRUD (insert, select, update, delete) with `supabase-js`.
- How to store secrets in environment variables, and why only `NEXT_PUBLIC_` variables are available in the browser.
- How Row Level Security and policies work in Supabase.
- How to update React state locally after each database call so the UI changes without reloading the page.
- How to write client-side form validation and show error messages next to each field.
- How to build a search filter that works with several words and highlights the matches.
- How to build modals, toast notifications and animations using only CSS and React state.
- How to make a layout responsive and style a custom scrollbar for a fixed-height scrolling table.
- How to deploy a Next.js app to Vercel and add environment variables there.

## Problems Faced
- **Invalid supabaseUrl error:** the app crashed with "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL". The cause was a wrong or missing value in the `.env` file. I fixed it by using the Project URL from Supabase (it must start with `https://`) and restarting the dev server.
- **Creating the table:** I had to learn how to run SQL in the Supabase SQL Editor and enable a Row Level Security policy so the app could read and write data.
- **Search issues:** the first search compared the typed text directly with the phone number, so numbers with spaces did not match. I rewrote the search to match every typed word and ignore spaces and dashes in phone numbers.
- **Scrollbar styling:** a global `scrollbar-color` rule overrode my custom table scrollbar in Chrome. I removed it and styled the table scrollbar separately, with a Firefox fallback.
- **Fixed table height:** the table needed a fixed height and a visible Y-axis scrollbar after three users, so I tuned the height to fit the header and three rows.
- **Vercel deployment:** the deployment did not appear because filters were applied on the Deployments page and the environment variables were missing. I removed the filters, added the Supabase variables in the project settings and redeployed.




## Security Note
No passwords, API keys or `.env` files are uploaded to GitHub. Only `.env.example` with placeholder values is included.