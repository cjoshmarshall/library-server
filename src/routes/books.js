const express = require("express");
const router = express.Router();
const Book = require("../model/book");
const { verifyTokenAndAdmin } = require("../middleware/token");

router.get("/", async (req, res) => {
  try {
    const books = await Book.find({});
    if (!books[0]) return res.status(204).send("No Books are Present");
    res.status(200).json(books);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json("Book Not Found");
    res.status(200).json(book);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.post("/", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(200).json(savedBook);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedBook) return res.status(204).send("Book Not Found");
    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.put("/status/:id", async (req, res) => {
  const { status } = req.body;

  try {
    if (!status) return res.status(400).send("Invalid status value");

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!updatedBook) return res.status(204).send("Book Not Found");
    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    res.status(200).send("Book was Removed");
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

module.exports = router;
