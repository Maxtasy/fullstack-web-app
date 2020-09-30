const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

// All Books Route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.published_before != null && req.query.published_before != "") {
    query = query.lte("publishDate", req.query.published_before);
  }
  if (req.query.published_after != null && req.query.published_after != "") {
    query = query.gte("publishDate", req.query.published_after);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/");
  }
});

// New Book Route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publish_date),
    pageCount: req.body.page_count,
    description: req.body.description
  });

  saveCover(book, req.body.cover);
  
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`);
    res.redirect(`books`);
  } catch {
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError=false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    if (hasError) params.errorMessage = "Error creating Book";
    res.render("books/new", params);
  } catch {
    res.redirect("books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;