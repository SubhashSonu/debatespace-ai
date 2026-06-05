const jwt = require("jsonwebtoken");

const User = require("../models/User");

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not defined");
  }

  return "development_jwt_secret_change_me";
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const buildAuthResponse = (user) => ({
  success: true,
  token: generateToken(user._id),
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
  },
});

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Username, email, and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  });

  if (existingUser) {
    res.status(409);
    throw new Error("User with this email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  res.status(201).json(buildAuthResponse(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json(buildAuthResponse(user));
};

module.exports = {
  register,
  login,
};
