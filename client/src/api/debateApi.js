import api from "./axios";

export const createDebate = (debateData) => {
  return api.post("/debates/create", debateData);
};

export const getDebate = (roomId) => {
  return api.get(`/debates/${roomId}`);
};

export const endDebate = async (roomId, endReason) => {
  return api.post(`/debates/${roomId}/end`, {
    endReason,
  });
};

export const getDebateHistory = () => {
  return api.get("/debates/history");
};

export const getNotes = (roomId) => {
  return api.get(`/debates/${roomId}/notes`);
};

export const addNote = (roomId, noteData) => {
  return api.post(`/debates/${roomId}/notes`, noteData);
};

export const deleteNote = (
  roomId,
  noteId
) => {
  return api.delete(
    `/debates/${roomId}/notes/${noteId}`
  );
};

export const getMyDebates = () => {
  return api.get(
    "/debates/my-rooms"
  );
};

export const generateSummary = (roomId) =>
  api.post(`/debates/${roomId}/generate-summary`);

export const deleteDebate = (
  roomId
) =>
  api.delete(
    `/debates/${roomId}`
  );