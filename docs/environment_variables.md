# Environment Variables Configuration

This document specifies the required environment configurations for the Vaultz Links Client and Server applications.

---

## 1. Backend Server Configuration (`.env`)

The backend configuration is managed by the `dotenv` package. A `.env` file must be created in the `server/` root directory.

### Configuration Fields
| Key | Required | Default / Example | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5000` | Port on which the Express.js API runs. |
| `NODE_ENV` | **Yes** | `development` | Running environment mode (`development` or `production`). Crashing checks and verbose logging patterns are tied to this flag. |
| `MONGO_URI` | **Yes** | `mongodb+srv://...` | Connection URI string for the MongoDB Atlas database instance. |
| `WP_JWT_SECRET`| **Yes** | *None* | Shared cryptographic secret key. Must match the secret configured in the WordPress JWT Auth plugin on the WordPress site. (Required to verify/sign user JWTs). |
| `WP_URL` | No | `https://thevaultznews.com` | Base URL of the WordPress site where credentials are validated. If left blank, auth runs in Mock Dev Mode automatically. |
| `CLIENT_URL` | **Yes** | `http://localhost:3000` | Allowed Origin domain for CORS requests (can be a comma-separated list of origins in production). |
| `BASE_URL` | No | `http://localhost:5000` | Public base URL used to construct short redirect links (e.g. `https://vlz.link` in production). |

---

## 2. Frontend Client Configuration (`.env.local`)

Next.js manages public configuration variables prefixing them with `NEXT_PUBLIC_`. These are compiled into client-side code.

A `.env.local` file must be created in the `client/` root directory.

### Configuration Fields
| Key | Required | Default / Example | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:5000/api` | Full URL point of the backend Express API server. |
| `NEXT_PUBLIC_APP_NAME` | No | `Vaultz Links` | Site branding title displayed in page headers and SEO metadata. |
