const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* 현서와 얘기 필요

-마이페이지에서 사용자 정보 get

-마이페이지에서 수정된 사용자 정보 put/patch

-이웃 목록 조회 */

router.get("/:userId/neighbors", async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }
        
        const neighbors = user.neighbors || [];
        res.json(neighbors);
    } catch (error) {
        console.error("이웃 목록 조회 중 오류 발생:", error);
        res
        .status(500)
        .json({
            error: "이웃 목록을 가져오는데 실패했습니다. 다시 시도해 주세요.",
        });
    }
});

// 이웃 ID 검색
router.get("/search", async (req, res) => {
    try {
        console.log("Query Parameters:", req.query); // 디버깅용 로그
        const { userID } = req.query; // URL의 쿼리 파라미터와 일치하도록 수정
        
        // 쿼리 파라미터가 없으면 오류 반환
        if (!userID) {
            return res
            .status(400)
            .json({ error: "Query parameter userID is required" });
        }
        
        const userRoutes = await User.find({ userID: new RegExp(userID, "i") });
        
        if (userRoutes.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        
        res.json(userRoutes);
    } catch (error) {
        console.error("사용자 검색 오류:", error);
        res.status(500).json({ error: "사용자 검색에 실패했습니다." });
    }
});

// 선택 이웃 추가
router.post("/:userId/neighbors", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const neighborToAdd = await User.findOne({ userID: req.body.neighborId });
  
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
      }
  
      if (!neighborToAdd) {
        return res
          .status(404)
          .json({ error: "추가할 사용자를 찾을 수 없습니다." });
      }
  
      if (user._id.toString() === neighborToAdd._id.toString()) {
        return res
          .status(400)
          .json({ error: "자기 자신은 이웃으로 추가할 수 없습니다." });
      }
  
      if (user.neighbors.includes(neighborToAdd._id)) {
        return res.status(400).json({ error: "이미 이웃입니다." });
      }
  
      user.neighbors.push(neighborToAdd._id);
      await user.save();
  
      if (!neighborToAdd.neighbors.includes(user._id)) {
        neighborToAdd.neighbors.push(user._id);
        await neighborToAdd.save();
      }
  
      res.status(201).json(user.neighbors);
    } catch (error) {
      res.status(500).json({ error: "이웃 추가에 실패했습니다." });
    }
  });
  
  // 이웃 삭제
  router.delete("/:userId/neighbors/:neighborId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const neighborToRemove = await User.findById(req.params.neighborId);
  
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
      }
  
      if (!neighborToRemove) {
        return res.status(404).json({ error: "삭제할 이웃을 찾을 수 없습니다." });
      }
  
      if (!user.neighbors.includes(neighborToRemove._id)) {
        return res.status(400).json({ error: "이웃 목록에 없습니다." });
      }
  
      user.neighbors = user.neighbors.filter(
        (neighbor) => !neighbor.equals(neighborToRemove._id)
      );
      await user.save();
  
      if (neighborToRemove.neighbors.includes(user._id)) {
        neighborToRemove.neighbors = neighborToRemove.neighbors.filter(
          (neighbor) => !neighbor.equals(user._id)
        );
        await neighborToRemove.save();
      }
  
      res.status(200).json({ message: "이웃이 삭제되었습니다." });
    } catch (error) {
      res.status(500).json({ error: "이웃 삭제에 실패했습니다." });
    }
  });
  
  module.exports = router;
  