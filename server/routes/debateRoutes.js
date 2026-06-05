const express = require("express");

const {
  createDebate,
  getDebate,
  endDebate,
  getDebateHistory,
  getNotes,
  addNote,
  deleteNote,
  getMyDebates,
  generateSummary,
  deleteDebate,
} = require(
  "../controllers/debateController"
);

const protect = require("../middleware/protect");
const { GenerativeModel } = require("@google/generative-ai");


const router =
  express.Router();

router.post(
  "/create",
  protect,
  createDebate
);

router.get(
  "/history",
  protect,
  getDebateHistory
);


router.get(
  "/:roomId/notes",
  protect,
  getNotes
);

router.post(
  "/:roomId/notes",
  protect,
  addNote
);

router.delete(
  "/:roomId/notes/:noteId",
  protect,
  deleteNote
);

router.get(
  "/my-rooms",
  protect,
  getMyDebates
);

router.post(
  "/:roomId/generate-summary",
  protect,
  generateSummary
);


router.delete(
  "/:roomId",
  protect,
  deleteDebate
);


router.get(
  "/:roomId",
  protect,
  getDebate
);

router.post(
  "/:roomId/end",
  protect,
  endDebate
);

module.exports = router;