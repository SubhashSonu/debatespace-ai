const crypto = require("crypto");
const Debate = require("../models/Debate");
const { callGeminiSummary } = require("./aiController");

const isAuthorizedUser = (debate, userId) => {
  const isCreator =
    debate.createdBy && debate.createdBy.toString() === userId.toString();

  const isParticipant = debate.participants.some(
    (participant) => participant.userId.toString() === userId.toString(),
  );

  return isCreator || isParticipant;
};

const createDebate = async (req, res) => {
  try {
    const { topic, duration } = req.body;

    const roomId = crypto.randomUUID();

    const debate = await Debate.create({
      roomId,
      topic,
      duration,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      roomId: debate.roomId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create debate",
    });
  }
};

const getDebate = async (req, res) => {
  try {
    const { roomId } = req.params;

    const debate = await Debate.findOne({
      roomId,
    });

    if (!debate) {
      return res.status(404).json({
        message: "Debate not found",
      });
    }

    return res.status(200).json(debate);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch debate",
    });
  }
};

const endDebate = async (req, res) => {
  try {
    const { roomId } = req.params;

    const { endReason } = req.body;

    const debate = await Debate.findOne({
      roomId,
    });

    if (!debate) {
      return res.status(404).json({
        message: "Debate not found",
      });
    }

    if (debate.status === "ended") {
      return res.status(200).json({
        message: "Debate already ended",
      });
    }

    debate.status = "ended";

    debate.endedAt = new Date();

    debate.endReason = endReason;

    await debate.save();

    return res.status(200).json({
      message: "Debate ended successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to end debate",
    });
  }
};

const addParticipant = async (roomId, userId, username) => {
  const debate = await Debate.findOne({
    roomId,
  });

  if (!debate) {
    return;
  }

  const exists = debate.participants.some(
    (p) => p.userId.toString() === userId.toString(),
  );

  if (!exists) {
    debate.participants.push({
      userId,
      username,
    });

    await debate.save();
  }
};

const startDebate = async (roomId) => {
  const debate = await Debate.findOne({
    roomId,
  });

  if (!debate) {
    return;
  }

  if (!debate.startedAt) {
    debate.startedAt = new Date();

    debate.status = "active";

    await debate.save();
  }
};

const endDebateByServer = async (roomId, reason) => {
  const debate = await Debate.findOne({
    roomId,
  });

  if (!debate) {
    return;
  }

  if (debate.status === "ended") {
    return;
  }

  debate.status = "ended";

  debate.endedAt = new Date();

  debate.endReason = reason;

  await debate.save();
};

const getDebateHistory = async (req, res) => {
  try {
    const debates = await Debate.find({
      "participants.userId": req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(debates);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};

const addNote = async (req, res) => {
  try {
    const { roomId } = req.params;

    const { title, content } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Content is required",
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        message: "Title must be less than 100 characters",
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: "Content must be less than 1000 characters",
      });
    }

    const debate = await Debate.findOne({
      roomId,
    });

    if (!debate) {
      return res.status(404).json({
        message: "Debate not found",
      });
    }

    if (!isAuthorizedUser(debate, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    debate.notes.push({
      userId: req.user._id,

      username: req.user.username,

      title,
      content,
    });

    await debate.save();

    return res.status(201).json({
      message: "Note added successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add note",
    });
  }
};

const getNotes = async (req, res) => {
  try {
    const { roomId } = req.params;

    const debate = await Debate.findOne({
      roomId,
    });

    if (!debate) {
      return res.status(404).json({
        message: "Debate not found",
      });
    }

    const userNotes = debate.notes.filter(
      (note) => note.userId.toString() === req.user._id.toString(),
    );

    return res.status(200).json(userNotes);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { roomId, noteId } = req.params;

    const debate = await Debate.findOne({
      roomId,
    });

    if (!debate) {
      return res.status(404).json({
        message: "Debate not found",
      });
    }

    if (!isAuthorizedUser(debate, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const note = debate.notes.find((n) => n._id.toString() === noteId);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    debate.notes = debate.notes.filter((n) => n._id.toString() !== noteId);

    await debate.save();

    return res.status(200).json({
      message: "Note deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete note",
    });
  }
};

const getMyDebates = async (req, res) => {
  try {
    const debates = await Debate.find({
      createdBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(debates);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch debates",
    });
  }
};

const generateSummary = async (req, res) => {
  try {
    const { roomId } = req.params;

    const debate = await Debate.findOne({ roomId });

    if (!debate) {
      return res.status(404).json({
        message: "Debate not found",
      });
    }

    if (!isAuthorizedUser(debate, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    if (debate.status !== "ended") {
      return res.status(400).json({
        message: "Summary can only be generated after debate ends",
      });
    }

    if (debate.summary && debate.summary.trim() !== "") {
      return res.json({
        success: true,
        summary: debate.summary,
      });
    }

    if (debate.notes.length === 0) {
      return res.status(400).json({
        message: "No notes found for this debate",
      });
    }

    const notesText = debate.notes
      .map(
        (note) => `
User: ${note.username}

Title: ${note.title}

Content:
${note.content}
`,
      )
      .join("\n----------------\n");

    const summary = await callGeminiSummary({
      topic: debate.topic,
      notesText,
    });

    debate.summary = summary;

    await debate.save();

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteDebate = async (req, res) => {
  const debate = await Debate.findOne({
    roomId: req.params.roomId,
  });

  if (!debate) {
    return res.status(404).json({
      message: "Debate not found",
    });
  }

  if (!debate.createdBy.equals(req.user._id)) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  await debate.deleteOne();

  res.json({
    success: true,
    message: "Debate deleted successfully",
  });
};

module.exports = {
  createDebate,
  getDebate,
  endDebate,
  addParticipant,
  startDebate,
  endDebateByServer,
  getDebateHistory,
  addNote,
  getNotes,
  deleteNote,
  getMyDebates,
  generateSummary,
  deleteDebate,
};
