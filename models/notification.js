const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 알림 스키마 정의
const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 알림 받는 사람
    message: { type: String, required: true }, // 알림 메시지
    type: { type: String, enum: ['diary_member', 'neighbor'], required: true }, // 알림 유형
    createdAt: { type: Date, default: Date.now } // 알림 생성 날짜
});

// 알림 모델 생성 및 내보내기
module.exports = mongoose.model('Notification', notificationSchema);
