const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  spotifyId: { type: String, required: true, unique: true },
  albumName: { type: String },
  albumCover: { type: String },
  previewUrl: { type: String },
  duration: { type: Number },  // 노래 길이 (밀리초)
  addedAt: { type: Date, default: Date.now }  // 노래가 데이터베이스에 추가된 시간
});

module.exports = mongoose.model('Song', songSchema);