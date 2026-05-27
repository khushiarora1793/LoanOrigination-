# Loan Origination & Approval System

A full-stack loan management platform built with Node.js, Express, MongoDB, Mongoose and React. Customers can register, apply for loans and track status. Loan officers can review applications with eligibility scoring evidence and approve or reject each case.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Frontend: React, Vite, React Router, Axios, React Toastify, Lucide icons
- Security: JWT authentication, role-based access control, Helmet, rate limiting

## Project Structure

```text
/backend
  /src
    /config
    /controllers
    /middleware
    /models
    /routes
    /scripts
    /services
    /utils
/frontend
  /src
    /api
    /components
    /context
    /pages
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Backend runs at `http://localhost:5000`. Use local MongoDB or replace `MONGO_URI` with a MongoDB Atlas connection string.

Environment variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/loan_origination
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

Seed accounts:

- Customer: `ravi@example.com` / `P@ssw0rd`
- Officer: `officer@example.com` / `P@ssw0rd`

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Documentation

All routes except `/auth/*` require:

```http
Authorization: Bearer <token>
```

### Auth

`POST /auth/register`

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "P@ssw0rd",
  "role": "CUSTOMER",
  "income": 95000,
  "creditScore": 760
}
```

`POST /auth/login`

```json
{
  "email": "ravi@example.com",
  "password": "P@ssw0rd"
}
```

### Customer Loans

`POST /loans/apply`

```json
{
  "amountRequested": 500000,
  "tenureMonths": 24
}
```

`GET /loans/mine`

`GET /loans/:id/status`

### Officer Review

`GET /officer/loans`

`GET /officer/loans/pending`

`POST /officer/loans/:id/review`

```json
{
  "decision": "APPROVED",
  "decisionNote": "Verified income and score."
}
```

## Eligibility Logic

`loanService.evaluateLoan(applicationId)` fetches the application and linked customer through MongoDB aggregation, normalizes income and credit score, and computes:

```text
score = (0.6 * creditScoreNorm) + (0.4 * incomeNorm)
```

The score is compared against a dynamic threshold based on requested amount. Customer applications store the score immediately, while officers see the system recommendation before making the final approval decision.

## Demo Walkthrough Script

1. Show backend structure: models, controllers, routes, middleware, services.
2. Register or login as customer and submit a loan application.
3. Explain eligibility score calculation and stored MongoDB references.
4. Login as officer and review pending applications.
5. Approve or reject a loan and show status updating in the customer dashboard.
