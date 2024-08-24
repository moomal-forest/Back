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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.tokens.push({ token: refreshToken });
    await user.save();

    // 저장된 토큰 정보와 함께 응답 반환
    res.status(201).json({ 
      message: `${user.fullname}님, 회원가입 성공했습니다.`,
      accessToken, 
      refreshToken,
      tokens: user.tokens  // 저장된 토큰들을 함께 반환
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 로그인 핸들러 수정 -- 중복된 refreshToken 처리
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
    let refreshToken = null;
    const now = Math.floor(Date.now() / 1000);

    // 만료된 토큰 제거
    user.tokens = user.tokens.filter(tokenObj => {
      const decoded = jwt.decode(tokenObj.token);
      return decoded && decoded.exp > now;
    });

    // 중복된 refreshToken이 있는지 확인
    refreshToken = user.tokens.find(tokenObj => {
      const decoded = jwt.decode(tokenObj.token);
      return decoded && decoded.exp > now;
    })?.token;

    // 유효한 refreshToken이 없다면 새로운 토큰 발급
    if (!refreshToken) {
      refreshToken = generateRefreshToken(user);
      user.tokens.push({ token: refreshToken });
    }

    // 변경된 토큰 리스트를 저장
    await user.save();

    res.json({ 
      message: `${user.fullname}님, 로그인 성공했습니다.`,
      accessToken, 
      refreshToken,
      tokens: user.tokens
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});


// 로그아웃 핸들러 추가
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh Token이 필요합니다." });
    }

    // 해당하는 refreshToken을 데이터베이스에서 삭제
    const user = await User.findOneAndUpdate(
      { "tokens.token": refreshToken },
      { $pull: { tokens: { token: refreshToken } } }, // tokens 배열에서 해당 refreshToken 삭제
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "유효하지 않은 Refresh Token입니다." });
    }

    res.json({ message: "정상적으로 로그아웃되었습니다." });
  } catch (error) {
    console.error("로그아웃 오류:", error);
    res.status(500).json({ message: "서버 에러" });
  }
});


module.exports = router;
