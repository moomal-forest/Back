const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emotionSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String 
  },
  icon: { 
    type: String // 감정을 나타내는 이모지나 아이콘의 URL 또는 코드
  },
  color: { 
    type: String // 감정과 연관된 색상 (예: "#FFA500" for 주황색)
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Emotion = mongoose.model('Emotion', emotionSchema);

module.exports = Emotion;