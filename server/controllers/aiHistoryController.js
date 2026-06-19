const DebateConversation = require("../models/DebateConversation");
const {
  getCache,
  setCache,
  deleteCache,
  deleteCaches,
  CACHE_TTL,
} = require("../utils/cache");
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

  await deleteCache(`ai-conversations:${req.user._id}`);

  res.status(201).json({
    success: true,
    conversation,
  });
};

const listConversations = async (req, res) => {
  const cacheKey = `ai-conversations:${req.user._id}`;

  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    console.log("Ai Conversation List Cache Hit");
    return res.json(cachedData);
  }

  console.log("AI Conversation List Cache Miss");

  const conversations = await DebateConversation.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select("title topic updatedAt createdAt messages")
    .lean();

  await setCache(
    cacheKey,
    {
      success: true,
      conversations,
    },
    CACHE_TTL.AI_LIST,
  );

  res.json({
    success: true,
    conversations,
  });
};

const getConversation = async (req, res) => {
  const cacheKey = `ai-conversation:${req.params.conversationId}`;

  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    console.log("AI Conversation Cache Hit");

    return res.json(cachedData);
  }

  console.log("AI Conversation Cache Miss");
  
  const conversation = await DebateConversation.findOne({
    _id: req.params.conversationId,
    user: req.user._id,
  }).lean();

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  await setCache(
    cacheKey,
    {
      success: true,
      conversation,
    },
    CACHE_TTL.AI_CONVERSATION,
  );

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

  await deleteCaches(
    `ai-conversations:${req.user._id}`,
    `ai-conversation:${conversation._id}`,
  );

  res.json({
    success: true,
    conversationId: conversation._id,
    reply: opponentReply,
    messages: conversation.messages,
  });
};

const deleteConversation = async (req, res) => {
  const conversation = await DebateConversation.findOneAndDelete({
    _id: req.params.conversationId,
    user: req.user._id,
  });

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  await deleteCaches(
    `ai-conversations:${req.user._id}`,
    `ai-conversation:${req.params.conversationId}`,
  );

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
