const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// 특정 사용자의 알림 목록 가져오기
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: '알림을 가져오는 중 오류가 발생했습니다.' });
    }
});

module.exports = router;