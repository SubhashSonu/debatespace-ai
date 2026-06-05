import api from "./axios";

export const getDebateConversations = () => api.get("/ai/conversations");

export const createDebateConversation = (topic) =>
  api.post("/ai/conversations", { topic });

export const getDebateConversation = (conversationId) =>
  api.get(`/ai/conversations/${conversationId}`);

export const sendDebateConversationMessage = (conversationId, payload) =>
  api.post(`/ai/conversations/${conversationId}/messages`, payload);

export const deleteDebateConversation = (conversationId) =>
  api.delete(`/ai/conversations/${conversationId}`);
