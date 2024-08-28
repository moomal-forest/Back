const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// 라우터 imports
const userRoutes = require("./routes/userRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const musicRoutes = require("./routes/musicRoutes");
const authRoutes = require("./routes/authRoutes"); 
const postRoutes = require('./routes/postRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // 새로운 인증 라우터 추가

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // 환경 변수로 프론트엔드 URL 설정
    credentials: true,
  })
); // cors를 미들웨어로 사용

const port = process.env.PORT || 3080; // 포트를 환경 변수에서 가져옴

// 데이터베이스 연결
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 라우터 설정
app.use("/api/users", userRoutes);
app.use("/api/diaries", diaryRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/auth", authRoutes); 
app.use('/api/posts', postRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/notifications', notificationRoutes);// 인증 라우터 추가

// 서버의 루트 경로('/')에 대한 GET 요청 처리
app.get("/", (req, res) => {
  res.send("Welcome to the Moomalforest API");
});

// 서버 오류 처리
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
});

// 3080 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
