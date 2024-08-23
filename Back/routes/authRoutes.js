const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// JWT 토큰 생성 함수
function generateAccessToken(user) {
  return jwt.sign(
    { user: {id: user._id}},
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "20m"}
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { user: {id: user._id}},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d"}
  );
}

// 회원가입 핸들러
router.post('/signup', async (req, res) => {
  try {
    const { userID, fullname, password } = req.body;

    let user = await User.findOne({ userID });
    if (user) {
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      userID,
      fullname,
      password: hashedPassword
    });

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.tokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 로그인 핸들러
router.post('/login', async (req, res) => {
  try {
    const { userID, password } = req.body;

    const user = await User.findOne({ userID });
    if (!user) {
      return res.status(400).json({ message: "아이디가 존재하지 않습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.tokens.push({ token: refreshToken });
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 액세스 토큰 갱신 핸들러
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token이 없습니다." });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || !user.tokens.some(token => token.token === refreshToken)) {
      return res.status(403).json({ message: "유효하지 않은 Refresh Token입니다." });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "유효하지 않은 Refresh Token입니다." });
  }
});

module.exports = router;