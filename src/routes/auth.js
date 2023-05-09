const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/user");

router.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User Not Found");

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(404).send("Password is Wrong");

    const accessToken = jwt.sign(
      { username: user.username, admin: user.admin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { username: user.username, admin: user.admin },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    const { password, ...rest } = user._doc;
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ ...rest, accessToken });
  } catch (err) {
    return res.status(500).send("Something Went Wrong");
  }
});

router.post("/signup", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) return res.status(403).send("User Already Exists");

    const salt = await bcrypt.genSalt();
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    const accessToken = jwt.sign(
      { username: savedUser.username, admin: savedUser.admin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { username: savedUser.username, admin: savedUser.admin },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "60m" }
    );

    const { password, ...rest } = savedUser._doc;
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ ...rest, accessToken });
  } catch (err) {
    return res.status(500).send("Something Went Wrong");
  }
});

router.get("/refresh", (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.sendStatus(403);

      const user = await User.findOne({ username: decoded.username });
      if (!user) return res.sendStatus(401);

      const accessToken = jwt.sign(
        { username: decoded.username, admin: user.admin },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );
      res.json({ admin: user.admin, accessToken });
    }
  );
});

router.get("/signout", (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  res.clearCookie("jwt", { httpOnly: true });
  res.sendStatus(204);
});

module.exports = router;
