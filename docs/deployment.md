# Production Deployment Guide

This guide details steps to deploy the Vaultz Links backend API server and Next.js frontend client into production environments.

---

## 1. Database Setup: MongoDB Atlas

1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster or Serverless database.
3. Set up **Database Access**: Create a database user with read/write permissions to a specific database (e.g. `vaultz_links`).
4. Set up **Network Access**: Add IP Whitelist entries. For cloud providers (like Render or Vercel), you may need to allow access from anywhere (`0.0.0.0/0`) or use VPC peering/static outgoing IPs.
5. Retrieve the MongoDB Connection URI: Select **Connect** -> **Drivers** -> Node.js, and copy the SRV link (e.g. `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/vaultz_links?retryWrites=true&w=majority`).

---

## 2. WordPress JWT Authentication Setup

To validate users using WordPress credentials, your WordPress site must have the JWT Authentication plugin configured:

1. Install the **JWT Auth** plugin (e.g., *JWT Authentication for WP-API* by pitch-grade or similar).
2. Edit the WordPress `wp-config.php` file to define the JWT Secret Key:
   ```php
   define('JWT_AUTH_SECRET_KEY', 'your-strong-random-secret-key-phrase');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```
3. Ensure this secret matches the `WP_JWT_SECRET` environment variable configured in your Express backend `.env`.

---

## 3. Backend Deployment: Express API Server

The backend can be hosted on platforms like **Render**, **Railway**, **Heroku**, or a custom VPS.

### Option A: Hosting on Render / Railway
1. Push your repository to GitHub.
2. Link your repository to Render/Railway as a **Web Service**.
3. Configure the following build settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the **Environment Variables** in the provider dashboard (do not upload the `.env` file):
   - `NODE_ENV=production`
   - `MONGO_URI=mongodb+srv://...`
   - `WP_JWT_SECRET=your-shared-wordpress-key`
   - `WP_URL=https://your-wordpress-site.com`
   - `CLIENT_URL=https://your-frontend-domain.com`
   - `BASE_URL=https://your-short-link-domain.com` (If you have a short domain mapped to redirect visitors, e.g. `https://vlz.link`)
   - `PORT=80` (or leave default to let Render bind dynamic ports).

### Option B: Hosting on VPS (Ubuntu, PM2, Nginx)
1. Clone the project onto the server.
2. Install PM2 globally: `npm install -g pm2`.
3. Create the `.env` file in the `server/` directory and populate production values.
4. Start the server using PM2:
   ```bash
   cd server
   pm2 start src/index.js --name "vaultz-links-api"
   pm2 save
   pm2 startup
   ```
5. Configure Nginx as a reverse proxy for port `5000` (or whatever `PORT` you chose) and enable SSL (e.g. using Let's Encrypt Certbot).

---

## 4. Frontend Deployment: Next.js Client

The client is optimized for serverless platforms like **Vercel** or **Netlify**.

### Deploying on Vercel
1. Link your repository to Vercel.
2. Select the `client` directory as the project root.
3. Vercel automatically detects Next.js build settings:
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Configure the **Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://your-backend-api-domain.com/api`
   - `NEXT_PUBLIC_APP_NAME=Vaultz Links`
5. Click **Deploy**. Vercel will build and assign an SSL-enabled domain.

---

## 5. Post-Deployment Verification Checklist

1. **Redirection Engine**: Visit `https://your-short-domain.com/test-slug` and verify redirection goes to correct target destination.
2. **Access Control CORS**: Ensure Axios request logs from the frontend console do not return CORS preflight errors.
3. **Database Check**: Check MongoDB collection sizes to ensure `analytics` entries are successfully created for each redirect.
4. **Log Checks**: Inspect cloud logs (`Render`/`PM2`) to confirm no start warnings or DB connection retry flags are emitted.
