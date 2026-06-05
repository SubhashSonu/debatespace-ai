const DebateConversation = require("../models/DebateConversation");
const { callGeminiDebateOpponent } = require("./aiController");

const makeTitle = (topic) => topic.trim().slice(0, 60);

const createConversation = async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    res.status(400);
    throw new Error("topic is required");
  }

  const conversation = await DebateConversation.create({
    user: req.user._id,
    title: makeTitle(topic),
    topic,
    messages: [],
  });

  res.status(201).json({
    success: true,
    conversation,
  });
};

const listConversations = async (req, res) => {
  const conversations = await DebateConversation.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select("title topic updatedAt createdAt messages")
    .lean();

  res.json({
    success: true,
    conversations,
  });
};

const getConversation = async (req, res) => {
  const conversation = await DebateConversation.findOne({
    _id: req.params.conversationId,
    user: req.user._id,
  }).lean();

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  res.json({
    success: true,
    conversation,
  });
};

const sendMessage = async (req, res) => {
  const { userMessage, stance, debateStyle } = req.body;

  if (!userMessage) {
    res.status(400);
    throw new Error("userMessage is required");
  }

  const conversation = await DebateConversation.findOne({
    _id: req.params.conversationId,
    user: req.user._id,
  });

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  conversation.messages.push({
    role: "user",
    content: userMessage,
  });

  const opponentReply = await callGeminiDebateOpponent({
    topic: conversation.topic,
    userArgument: userMessage,
    stance,
    debateStyle,
    history: conversation.messages.slice(-10),
  });

  conversation.messages.push({
    role: "assistant",
    content: opponentReply,
  });

  await conversation.save();

  res.json({
    success: true,
    conversationId: conversation._id,
    reply: opponentReply,
    messages: conversation.messages,
  });
};

const deleteConversation = async (req, res) => {

  const conversation =
    await DebateConversation.findOneAndDelete({
      _id: req.params.conversationId,
      user: req.user._id,
    });

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  res.json({
    success: true,
    message: "Conversation deleted successfully",
  });
};

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  deleteConversation,
};
