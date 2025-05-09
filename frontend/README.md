# Frontend

**1.Tạo dự án Vite:**
- Cài đặt: 
    npm create vite@latest
    npm install
- Cài đặt Tailwind CSS:
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
- Cài đặt các thư viện bổ sung:
    npm install axios react-router-dom

**2. Cấu trúc thư mục**
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   └── Navbar.js
│   │   ├── lesson/
│   │   │   └── LessonCard.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── styles/
│   │   ├── index.css
│   ├── App.js
│   ├── index.js
│   └── routes.js
├── .env
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md