const mongoose = require("mongoose");

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
