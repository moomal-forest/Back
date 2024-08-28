const Notification = require('../models/notification');

// 알림 생성 함수
const createNotification = async (recipientId, message, type) => {
    const notification = new Notification({
        recipient: recipientId,
        message: message,
        type: type
    });

    await notification.save();
};

// 다이어리 멤버 알림 생성
const createDiaryMemberNotification = async (recipientId, diaryName) => {
    const message = `${diaryName} 다이어리의 멤버가 되었습니다.`;
    await createNotification(recipientId, message, 'diary_member');
};

// 이웃 추가 알림 생성
const createNeighborNotification = async (recipientId, neighborName) => {
    const message = `${neighborName}와 이웃이 되었습니다.`;
    await createNotification(recipientId, message, 'neighbor');
};

module.exports = {
    createDiaryMemberNotification,
    createNeighborNotification
};
