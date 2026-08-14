# Signet

Certificates, forged locally. A privacy-first workshop for self-signed TLS certificates, mTLS client certificates, and CSRs.

Private keys, certificates, and PFX files are generated **entirely in the browser**. Signet never stores them.

## Demo login

- Email: `demo@signet.dev`
- Password: `signet`
- Or continue as a guest — the generator does not require an account.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- `node-forge` for X.509 / CSR / PKCS#12
- `next-themes` for dark / light mode

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What is stored

| Data | Where |
| --- | --- |
| Certificates, private keys, CSRs, PFX | Never. In-memory for the current tab only. |
| Dummy accounts | `localStorage` on this device |
| History | Metadata only (CN, dates, fingerprint) in `localStorage` |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
