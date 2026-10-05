import Link from '../models/Link.js';

const notFoundPage = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Not Found</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #334155; }
    .container { text-align: center; max-width: 400px; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #0f172a; }
    p { color: #64748b; margin-bottom: 1.5rem; }
    a { color: #2563eb; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Link Not Found</h1>
    <p>The shortened link you are trying to access does not exist or has been deactivated.</p>
    <a href="https://thevaultzmedia.com">Go to Homepage</a>
  </div>
</body>
</html>`;

/**
 * @desc    Redirect a short link to its target and count the click
 * @route   GET /:slug
 * @access  Public
 */
export const handleRedirect = async (req, res) => {
  try {
    // One round trip: find the active link and bump its click counter.
    const link = await Link.findOneAndUpdate(
      { slug: req.params.slug.toLowerCase(), status: 'active' },
      { $inc: { clicks: 1 } },
      { projection: { targetUrl: 1 } }
    ).lean();

    if (!link) {
      return res.status(404).send(notFoundPage());
    }

    return res.redirect(302, link.targetUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).send('Internal Server Error');
  }
};
