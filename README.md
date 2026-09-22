# Consoomers

A full-stack product testing and review platform that connects **brands** with **real consumers ("testers")** — brands submit products for sampling, testers apply, try, and review them, and the community discovers products through quick votes, ratings, and curated collections.

Built and maintained by [Gurdit](mailto:gurdit@thefabcode.org).

---

## Overview

Consoomers is a three-sided marketplace with dedicated experiences for **Admins**, **Brands**, and **Testers**:

- **Brands** create accounts, submit products, run sample-request campaigns, and track reviews and engagement through a dashboard.
- **Testers** discover products, request samples, submit reviews, participate in quick votes, and build a public tester profile.
- **Admins** oversee the platform — approving brands, moderating content, managing users, and monitoring platform-wide analytics.

Role-specific capabilities are documented in [`docs/role`](docs/role):
- [Admin role](docs/role/ADMIN_ROLE.md)
- [Brand role](docs/role/BRAND_ROLE.md)
- [Tester role](docs/role/TESTER_ROLE.md)

A full REST API reference is available in [`docs/api/API_DOCUMENTATION.md`](docs/api/API_DOCUMENTATION.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, Radix UI, shadcn-style components |
| Database | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) |
| Auth | NextAuth.js (JWT sessions), bcrypt password hashing |
| State | Redux Toolkit |
| File Storage | AWS S3 |
| Email | Brevo (transactional email), Nodemailer |
| Realtime | Socket.IO |
| Forms & Validation | React Hook Form + Zod |
| Security | CSRF protection, rate limiting on sensitive endpoints |

---

## Key Features

- 🔐 Secure authentication with role-based access control (Admin / Brand / Tester)
- 📦 Product catalog with collections, categories, and rich media
- 🧪 Sample-request workflow between brands and testers
- ⭐ Verified product reviews and ratings
- 🗳️ Quick-vote polls for community feedback
- 🏢 Brand onboarding and approval pipeline
- 📊 Admin and brand analytics dashboards
- 👥 Referral / invite-a-friend system
- 🔒 CSRF protection and rate limiting across state-changing API routes
- 🛡️ GDPR-style data privacy tools (data export, account deactivation/deletion)

---

## Project Structure

```
src/
├── app/                # Next.js App Router — pages & API routes
│   ├── (main)/          # Public-facing site (products, brands, profiles, settings)
│   ├── accounts/         # Auth flows (sign-in, register, OTP, password reset)
│   └── api/              # REST API endpoints
├── actions/              # Server actions & shared utilities (mailer, CSRF, rate limiting, uploads)
└── db/                   # Drizzle ORM schema & database client
docs/
├── api/                  # API documentation
└── role/                 # Role-based feature documentation
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for media uploads)
- Brevo account (for transactional email)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with the required variables (database connection, NextAuth secret, AWS credentials, Brevo API key, etc.). See `src/db/db.ts` and `src/actions/` for the full list of variables consumed.

### Database Setup

```bash
npm run db:push
```

### Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run start
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Generate and push Drizzle schema migrations |

---

## License

See [LICENSE](LICENSE) for details.
