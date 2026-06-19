const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const healthRoutes = require("./routes/healthRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const debateRoutes = require("./routes/debateRoutes");
const redis = require("./config/redis");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/debates", debateRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DebateSpace AI API is running",
  });
});
app.get("/redis-test", async(req,res)=>{
   await redis.set("test", "hello");

  const value = await redis.get("test");

  res.json({
    value,
  });
})


app.use(notFound);
app.use(errorHandler);

module.exports = app;
