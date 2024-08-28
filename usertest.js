//필요없는 파일인데 포스트맨 테스트용으로 사용자 2명 넣음 걍

const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

const usertest1 = async () => {
  try {
    // 기존 사용자 삭제 (선택사항)
    await User.deleteMany({});
    console.log('기존 사용자 데이터를 삭제했습니다.');

    const user = new User({
      userID: 'john',
      password: 'hashed_password', // 실제 환경에서는 반드시 해시화된 비밀번호를 사용해야 합니다
      fullname: 'John Brahams'
    });

    await user.save();
    console.log('테스트 사용자(John)가 성공적으로 추가되었습니다.');
  } catch (error) {
    console.error('데이터베이스 시드 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
  }
};

const usertest2 = async () => {
    try {
      // 기존 사용자 삭제 (선택사항)
      await User.deleteMany({});
      console.log('기존 사용자 데이터를 삭제했습니다.');

      const user = new User({
        userID: 'llgalore',
        password: 'hashed_password', // 실제 환경에서는 반드시 해시화된 비밀번호를 사용해야 합니다
        fullname: 'Jeong Yeonkyung'
      });

      await user.save();
      console.log('테스트 사용자(llgalore)가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('데이터베이스 시드 중 오류 발생:', error);
    } finally {
      mongoose.connection.close();
    }
  };

usertest1();
usertest2();