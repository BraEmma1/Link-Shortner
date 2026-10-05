# Environment Variables

## Server / API (`server/.env`)
| Key | Required | Example | Purpose |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | **Yes** | `mongodb+srv://...` | MongoDB connection string. |
| `CLIENT_URL` | **Yes** | `https://thevaultzmedia.com` | Origin(s) of the web page that are allowed to call the API (CORS), comma-separated. Wildcards like `*.example.com` are supported. If this is wrong, the page's requests are blocked. |
| `BASE_URL` | No | `https://vlz.link` | Public base used to build short URLs. Links pointing at this domain are rejected to prevent redirect loops. |
| `PORT` | No | `5200` | Server port. |
| `NODE_ENV` | No | `production` | In production, missing required variables stop the server. |

## Web app (`client/.env.local`, or the hosting dashboard)
| Key | Required | Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:5200/api` | Backend API URL. The browser calls it directly. |

## Removed
`WP_JWT_SECRET`, `WP_URL`, `SHORTENER_KEY`, `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` are no longer used. Creating links is open to everyone.
