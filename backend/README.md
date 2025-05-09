# Backend
**1. Khởi tạo sự án Node.js:**
    - Cài đặt: 
        npm init -y
    - Cài đặt dependencies:
        npm install express mongoose dotenv cors bcryptjs jsonwebtoken
        npm install --save-dev nodemon

**2. Cấu trúc thư mục**
backend/
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   ├── authController.js
│   └── lessonController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   └── Lesson.js
├── routes/
│   ├── authRoutes.js
│   └── lessonRoutes.js
├── utils/
│   ├── errorHandler.js
│   └── jwtUtils.js
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md

