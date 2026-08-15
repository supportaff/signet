# SelfSignedCert

Free self-signed SSL certificate generator at [selfsignedcert.com](https://selfsignedcert.com).

Private keys, certificates, and PFX files are generated **entirely in the browser**. SelfSignedCert never stores them.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- `node-forge` for X.509 / CSR / PKCS#12
- Google OAuth for accounts
- Supabase for plan and login metadata only

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
| Google account, plan, usage | Supabase metadata only |
| History | Metadata only (CN, dates, fingerprint) in `localStorage` |
