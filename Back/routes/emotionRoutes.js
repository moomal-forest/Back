const express = require('express');
const router = express.Router();
const Emotion = require('../models/emotion');

// 모든 감정 조회
router.get('/', async (req, res) => {
  try {
    const emotions = await Emotion.find();
    res.json(emotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 새로운 감정 추가
router.post('/', async (req, res) => {
  const emotion = new Emotion({
    name: req.body.name,
    description: req.body.description,
    icon: req.body.icon,
    color: req.body.color
  });

  try {
    const newEmotion = await emotion.save();
    res.status(201).json(newEmotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 특정 감정 조회
router.get('/:id', getEmotion, (req, res) => {
  res.json(res.emotion);
});

// 감정 업데이트
router.patch('/:id', getEmotion, async (req, res) => {
  if (req.body.name != null) {
    res.emotion.name = req.body.name;
  }
  if (req.body.description != null) {
    res.emotion.description = req.body.description;
  }
  if (req.body.icon != null) {
    res.emotion.icon = req.body.icon;
  }
  if (req.body.color != null) {
    res.emotion.color = req.body.color;
  }
  res.emotion.updatedAt = Date.now();

  try {
    const updatedEmotion = await res.emotion.save();
    res.json(updatedEmotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 감정 삭제
router.delete('/:id', getEmotion, async (req, res) => {
  try {
    await res.emotion.remove();
    res.json({ message: '감정이 삭제되었습니다' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 미들웨어 함수: 특정 ID의 감정 찾기
async function getEmotion(req, res, next) {
  let emotion;
  try {
    emotion = await Emotion.findById(req.params.id);
    if (emotion == null) {
      return res.status(404).json({ message: '감정을 찾을 수 없습니다' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.emotion = emotion;
  next();
}

module.exports = router;