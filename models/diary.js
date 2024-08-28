const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
const diarySchema = new Schema({
        name: { type: String, required: true},
        color: { type: String, required: true},
        type: { type: String, enum: ['personal', 'exchange'], required: true },
        created_by: { type: Schema.Types.Objected, ref: 'Users', required: true},
        members: [{ type: Schema.Types.ObjectId, ref: 'Users' }], //멤버의 userID 배열
        created_at: { type: Date, default: Date.now}
});
*/

//포스트맨 테스트용 (created_by를 string으로 지정함)
const diarySchema = new Schema({
        name: { type: String, required: true},
        color: { type: String, required: true},
        type: { type: String, enum: ['personal', 'exchange'], required: true },
        created_by: { type: String, required: true},
        members: [{ type: String }], //멤버의 user_id 배열
        created_at: { type: Date, default: Date.now}
});

const Diary = mongoose.model('diary', diarySchema, 'diaries');
module.exports = Diary;
