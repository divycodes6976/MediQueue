# MediQueue frontend

React (Vite) + JavaScript. Auth uses React Context (`AuthContext`, `ToastContext`) — no Redux.

```bash
npm install
npm run dev
```

App: http://localhost:3000  
API calls go to `/proxy` and Vite forwards them to `http://localhost:3001` (or `VITE_API_URL`).
