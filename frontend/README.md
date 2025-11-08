# Mam Moi - Frontend (Scaffold)
This is a minimal React scaffold (Create React App style).
## How to run
1. Node.js 16+ and npm installed.
2. Open `frontend` folder.
3. Install: `npm install`
4. npm i -D tailwindcss postcss autoprefixer
5. npx tailwindcss init -p
6. chạy thêm các lệch sau nếu không chạy được
npx shadcn-ui@latest init
npm i class-variance-authority clsx tailwind-merge lucide-react
npm i framer-motion react-router-dom
npm i @radix-ui/react-dropdown-menu @radix-ui/react-separator @radix-ui/react-label @radix-ui/react-dialog @radix-ui/react-slot

7. Start: `npm start`
8. If your backend runs on another port, set REACT_APP_API_BASE environment variable, e.g.:
   REACT_APP_API_BASE=http://localhost:5000 npm start
