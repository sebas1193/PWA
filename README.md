# Progressive Web App — Login Demo

Ionic React PWA with email/password authentication using localStorage.

## Stack

- **Framework:** Ionic 8 + React 19
- **Build:** Vite 5
- **Mobile:** Capacitor 8
- **Routing:** React Router v5

## Auth flow

| Step | Action |
|---|---|
| First visit | Redirects to `/login` |
| Login | Validates `user@mail.com` / `123`, stores `logged=true` in localStorage |
| Already logged | Redirects directly to `/list` |
| Logout | Clears `logged` from localStorage, redirects to `/login` |

## Pages

- `/login` — email + password form
- `/list` — protected list page with logout button

## Run locally

```bash
cd login
npm install
npm run dev
```

## Project structure

```
login/
└── src/
    ├── App.tsx           # routing + auth redirect
    └── pages/
        ├── LoginPage.tsx
        └── ListPage.tsx
```
