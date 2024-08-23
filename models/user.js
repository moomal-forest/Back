const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
        userID: { type: String, required: true, unique: true, lowercase: true },
        fullname: { type: String, required: true},
        password: { type: String, required: true  }, // 반드시 해시화하여 저장
        signup_at: { type: Date, default: Date.now },
        modified_at: { type: Date, default: Date.now },
        neighbors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        tokens: [{ token: { type: String, required: true }}] // 현서와 jwt 얘기해봐야 함
});

const User = mongoose.model('user', userSchema, 'users');
module.exports = User;
