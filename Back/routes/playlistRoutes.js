const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const Emotion = require('../models/emotion');
const Song = require('../models/song');

// 1. 감정 목록 조회
router.get('/emotions', async (req, res) => {
  try {
    const emotions = await Emotion.find().select('name icon');
    res.json(emotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. 플레이리스트 조회 (감정별)
router.get('/playlist/:emotionId', async (req, res) => {
    try {
      const { emotionId } = req.params;
      const { order = 'desc' } = req.query; // 'asc' 또는 'desc', 기본값은 'desc' (최신순)
  
      const playlist = await Playlist.findOne({ emotion: emotionId })
        .populate('emotion')
        .populate({
          path: 'songs',
          options: { sort: order === 'asc' ? { _id: 1 } : { _id: -1 } }
        });
  
      if (!playlist) {
        return res.status(404).json({ message: '플레이리스트를 찾을 수 없습니다.' });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// 3. 노래 검색
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const songs = await Song.find({ 
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;