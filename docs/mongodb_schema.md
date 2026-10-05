# MongoDB Schema

One collection: **links** (model `Link`, [Link.js](../server/src/models/Link.js)).

| Field | Type | Notes |
| :--- | :--- | :--- |
| `slug` | String | Required, unique, lowercase, `a-z 0-9 - _`, 2-50 chars. Indexed by the unique constraint. |
| `targetUrl` | String | Required. Validated as an http(s) URL by the API. |
| `clicks` | Number | Default 0. Incremented on every redirect. |
| `status` | String | `active` (default), `inactive` or `expired`. Only `active` links redirect. |
| `createdAt`, `updatedAt` | Date | Added automatically. |

## Leftover data from the old version
Earlier versions also stored `users`, `analytics` and `qrcodes` collections and extra fields on links (`userId`, `title`). The app no longer reads or writes them. They can be dropped from MongoDB whenever you like; the extra link fields are ignored.
