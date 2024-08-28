const express = require('express');
const router = express.Router();
const Diary = require('../models/diary');

// 사용자가 다이어리 생성
router.post('/', async (req, res) => {
    const { name, color, type, neighbors } = req.body;
    const userId = req.user.id; // 현재 로그인한 사용자의 ID (인증 미들웨어에서 제공된다고 가정)
      
    if(!name || !color) {
        return res.status(400).json({error: "다이어리 제목과 색상을 입력해야 합니다."});
    }
  
    const members = [userId, ...(neighbors || [])]; //userId? userID?


/* 포스트맨 테스트용 router.post() - userID를 llgalore로 특정지어줌
router.post('/', async (req, res) => {
    const { name, color, type, neighbors } = req.body;
    const userId = "llgalore"; // ---> 이 부분
    
    if(!name || !color) {
        return res.status(400).json({error: "다이어리 제목과 색상을 입력해야 합니다."});
    }

    const members = ['llgolore', ...(neighbors || [])];
*/


    const diary = new Diary({
      name: req.body.name,
      color: req.body.color,
      type: neighbors.length > 0 ? 'exchange' : 'personal',  // neighbors에 따라 type 자동 설정
      created_by: userId,
      members: members
    });

// type과 neighbors의 일관성 검사
    if ((type === 'exchange' && (!neighbors || neighbors.length === 0)) ||
        (type === 'personal' && neighbors && neighbors.length > 0)) {
        return res.status(400).json({error: "다이어리 타입과 이웃 정보가 일치하지 않습니다."});
    }


    try {
      const savedDiary = await diary.save(); // save()를 async/await로 처리
      res.status(201).json({ result: 1, diary: savedDiary });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "다이어리 생성에 실패했습니다." });
    }
});



// 사용자의 모든 다이어리 조회
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const diaryRoutes = await Diary.find({ members: userId }).select('name color type');
    res.json(diaryRoutes);
  } catch (err) {
    console.error('다이어리 조회 중 오류 발생:', err);
    res.status(500).json({ error: "다이어리 목록을 가져오는데 실패했습니다."})
  }
});


/* 포스트맨 테스트용
router.get('/', async (req, res) => {
  try {
    const diaryRoutes = await Diary.find().select('name color type');
    res.json(diaryRoutes);
  } catch (err) {
    console.error('다이어리 조회 중 오류 발생:', err);
    res.status(500).json({ error: "다이어리 목록을 가져오는데 실패했습니다."})
  }
});
*/


module.exports = router;

