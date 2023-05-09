const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { db } = require("./db.js");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 3006;
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
db();

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/users", require("./routes/users.js"));
app.use("/api/books", require("./routes/books.js"));

app.listen(PORT, () => {
  console.log(`Server Running at port ${PORT}`);
});
