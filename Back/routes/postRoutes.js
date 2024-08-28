const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Playlist = require('../models/playlist');
const Song = require('../models/song');

// 1. 일기 목록 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. 일기 작성 (노래 추가 기능 포함)
router.post('/', async (req, res) => {
    try {
      const { diaryId, userId, content, emotion, spotifyTrackId, trackName, artistName, albumImageUrl, previewUrl } = req.body;
      // 1) 일기 생성
      const post = new Post({
        diaryId,
        userId,
        content,
        emotion,
        spotifyTrackId,
        trackName,
        artistName,
        albumImageUrl,
        previewUrl
      });
      const savedPost = await post.save();
  
      // 2) 노래 정보 저장 또는 조회
      let song = await Song.findOne({ spotifyId: spotifyTrackId });
      if (!song) {
        song = new Song({
          title: trackName,
          artist: artistName,
          spotifyId: spotifyTrackId,
          albumCover: albumImageUrl,
          previewUrl
        });
        await song.save();
      }
  
      // 3) 플레이리스트에 노래 추가
      let playlist = await Playlist.findOne({ emotion: emotion });
      if (!playlist) {
        playlist = new Playlist({ emotion, songs: [] });
      }
      if (!playlist.songs.includes(song._id)) {
        // 노래를 배열의 맨 앞에 추가 (최신 순)
        playlist.songs.unshift(song._id);
        await playlist.save();
      }
  
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  


// 3. 일기 삭제
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: '일기가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. 월별 대표 감정 조회
router.get('/monthly-emotion', async (req, res) => {
    try {
      const { year, month } = req.query;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
  
      const result = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 1
        }
      ]);
  
      if (result.length > 0) {
        res.json({ emotion: result[0]._id, count: result[0].count });
      } else {
        res.json({ message: '해당 월의 데이터가 없습니다.' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;