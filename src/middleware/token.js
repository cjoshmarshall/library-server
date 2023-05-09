const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // console.log(decoded);
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user.admin) return res.sendStatus(401);
    next();
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
};
