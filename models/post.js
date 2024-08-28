const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  diaryId: { type: Schema.Types.ObjectId, ref: 'Diary', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 },
  emotion: { type: String, required: true },
  spotifyTrackId: { type: String },
  trackName: { type: String },
  artistName: { type: String },
  albumImageUrl: { type: String },
  previewUrl: { type: String }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;