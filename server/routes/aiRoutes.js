const express = require("express");

const { debateOpponent } = require("../controllers/aiController");
const {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  deleteConversation,
} = require("../controllers/aiHistoryController");
const protect = require("../middleware/protect");


const router = express.Router();

router.post("/debate-opponent", debateOpponent);
router.post("/conversations", protect, createConversation);
router.get("/conversations", protect, listConversations);
router.get("/conversations/:conversationId", protect, getConversation);
router.post("/conversations/:conversationId/messages", protect, sendMessage);
router.delete(
  "/conversations/:conversationId",
  protect,
  deleteConversation
);

module.exports = router;
