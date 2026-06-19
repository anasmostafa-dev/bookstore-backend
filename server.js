const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config(); // تحسين استدعاء dotenv
const connectDB = require("./config/db");

// 1. Database Connection
connectDB();

// 2. Global Middlewares (الترتيب هنا حيوي جداً)

// أضفنا Middleware يدوي للتعامل مع Vercel Preflight Requests
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://book-store-ebon-ten-27.vercel.app",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-auth-token, Accept",
  );

  // لو الطلب OPTIONS (Preflight) نرد بـ 200 فوراً ونقفل الـ Request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// تفعيل مكتبة CORS كطبقة إضافية للتأكيد
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://book-store-ebon-ten-27.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Static Files
app.use("/images", express.static("public/images"));

// 4. Routes Imports
const userRouter = require("./routes/UserAuth");
const loginRouter = require("./routes/LoginAuth");
const getUserById = require("./routes/Users");
const booksRouter = require("./routes/Books");
const categoryRouter = require("./routes/Category");
const adminRouter = require("./routes/admin");
const cartsRouter = require("./routes/carts");
const orderRouter = require("./routes/order");

// 5. Routes Declaration
app.use("/api/register", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/users", getUserById);
app.use("/api/books", booksRouter);
app.use("/api/categories", categoryRouter);
app.use("/admin", adminRouter);
app.use("/carts", cartsRouter);
app.use("/orders", orderRouter);

// 6. Server Start
// مهم لـ Vercel: لا يفضل استخدام app.listen مباشرة في الـ Production
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server Running On http://localhost:${PORT}`);
  });
}

module.exports = app;
