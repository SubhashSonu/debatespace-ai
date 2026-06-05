const mongoose = require("mongoose");

const debateSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "active", "ended"],
      default: "waiting",
    },

    participants: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          username: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    notes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        username: {
          type: String,
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        content: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    summary: {
      type: String,
      default: "",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    endReason: {
      type: String,
      enum: ["timer", "user_left"],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Debate", debateSchema);
