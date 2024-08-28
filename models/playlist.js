const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  emotion: { type: Schema.Types.ObjectId, ref: 'Emotion', required: true },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]
});

module.exports = mongoose.model('Playlist', playlistSchema);