# RentLink Narok 🏠

A real-time rental house discovery platform for Narok, Kenya.

## Features

- **Real-time vacancy feed** — vacant rooms highlighted with pulsing red badges
- **All rooms listed** — every unit visible with status (Vacant / Occupied / Reserved)
- **Role-based access** — Tenant, Landlord, Admin
- **JWT authentication** — secure, cookie-based sessions
- **Admin approval flow** — all listings reviewed before going live
- **Google Maps integration** — pin-based apartment locations
- **Cloudinary images** — optimized image hosting
- **Full search & filters** — by type, neighborhood, price, vacancy
- **Mobile-first UI** — glassmorphism, gradients, smooth animations

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jose/jsonwebtoken) + bcrypt |
| Images | Cloudinary |
| Maps | Google Maps JavaScript API |
| Fonts | Syne (display) + Plus Jakarta Sans (body) |

## Project Structure

```
rentlink-narok/
├── prisma/
│   ├── schema.prisma          # DB schema: User, Apartment, Unit, Image
│   └── seed.ts                # Sample Narok data
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage / landing
│   │   ├── listings/
│   │   │   ├── page.tsx       # Browse all listings
│   │   │   └── [id]/page.tsx  # Apartment detail
│   │   ├── map/page.tsx       # Google Maps view
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Register (Tenant or Landlord)
│   │   ├── dashboard/
│   │   │   ├── landlord/      # Landlord: list, create, edit
│   │   │   └── admin/         # Admin: approve/reject
│   │   └── api/
│   │       ├── auth/          # login, register, logout, me
│   │       ├── apartments/    # CRUD + units + images
│   │       ├── admin/         # Admin-only endpoints
│   │       └── stats/         # Vacancy stats
│   ├── components/
│   │   ├── ui/VacancyBadge    # Pulsing red vacancy indicator
│   │   ├── apartments/        # ApartmentCard, SearchFilters
│   │   └── landing/Navbar     # Responsive navigation
│   ├── lib/
│   │   ├── prisma.ts          # DB client singleton
│   │   ├── auth.ts            # JWT + bcrypt utilities
│   │   ├── cloudinary.ts      # Image upload/delete
│   │   └── utils.ts           # Format, cn, timeAgo, etc
│   ├── types/index.ts         # TypeScript types + constants
│   └── styles/globals.css     # Global styles + animations
```

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd rentlink-narok
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rentlink_narok"
JWT_SECRET="your-super-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-key"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample Narok data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@rentlink.co.ke | admin123 |
| Landlord 1 | john@example.co.ke | landlord123 |
| Landlord 2 | mary@example.co.ke | landlord123 |

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/logout | Auth |
| GET | /api/auth/me | Auth |

### Apartments
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/apartments | Public |
| POST | /api/apartments | Landlord |
| GET | /api/apartments/:id | Public |
| PATCH | /api/apartments/:id | Landlord/Admin |
| DELETE | /api/apartments/:id | Landlord/Admin |
| PATCH | /api/apartments/:id/units/:unitId | Landlord/Admin |
| POST | /api/apartments/:id/images | Landlord/Admin |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/admin/apartments | Admin |

### Stats
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/stats | Public |

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set all environment variables in the Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Key Design Decisions

- **Vacancy highlighting** — VacancyBadge component uses animated pulsing red dots (`animate-ping`) so vacant units are unmissable
- **All rooms shown** — units array always fetched and displayed, with color-coded status badges
- **Admin gating** — apartments default to `PENDING` status, only `APPROVED` ones are public
- **Prisma relations** — cascade deletes ensure clean data when apartments are removed
- **JWT in cookies** — httpOnly cookies for server-side reads; also stored in localStorage for client-side dashboard use
- **Real-time feel** — `updatedAt` ordering means recently-updated vacancies appear first

## Neighborhoods Supported

Gate A, Gate B, Gate C, Gate D, Macedonia, Mau Narok, Enkare, Kaloleni, CBD, Pipeline, Milimani, Other

## House Types

Single Room, Bedsitter, One Bedroom, Two Bedroom, Three Bedroom
