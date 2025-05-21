
# QuickTicket Support System

A simple and fast support ticket system built with **Next.js 14**, **TypeScript**, **Prisma ORM**, **Neon Postgres database**, and **Sentry** for error tracking and performance monitoring.

---

## ✨ Features

- Create, view, and manage support tickets
- User authentication with JWT tokens
- Error and performance tracking with Sentry
- Responsive design using Tailwind CSS
- Secure session handling with HttpOnly cookies
- Built with modern Next.js App Router & Server Actions

---

## 🚀 Technologies

- Next.js 14 (App Router)  
- TypeScript  
- Prisma ORM  
- Neon.tech (Postgres Database)  
- Tailwind CSS  
- Sentry (Error & Performance Monitoring)  

---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/bradtraversy/quick-ticket
cd quickticket
```

### 2. Install dependencies

```bash
npm install
```

### 3. Sentry Setup

- Create a new Sentry project and run the provided wizard command.  
- This will create a `.env-sentry-plugin` file — rename it to `.env`.  
- The `.env` file will contain your Sentry Auth Token.

### 4. Neon Database Setup

- Create a Neon Postgres database.  
- Add your database connection string to the `.env` file:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=require"
```

### 5. Auth Setup

- Generate an auth secret by running:

```bash
openssl rand -hex 32
```

- Add it to your `.env` file as:

```env
NEXTAUTH_SECRET="<your_secret>"
```

### 6. Prisma Setup

Run Prisma commands to generate the client and apply migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. Run the development server

```bash
npm run dev
```

---

Enjoy building with QuickTicket! 🎉
