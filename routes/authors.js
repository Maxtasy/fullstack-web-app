const express = require("express");
const Author = require("../models/author");
const router = express.Router();

// All Authors Route
router.get("/", async (req, res) => {
  const searchOptions = {};

  if (req.query.author_name != null && req.query.author_name !== "") {
    searchOptions.name = new RegExp(req.query.author_name, "i");
  }
  
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/", {
      errorMessage: "Error loading Authors"
    });
  }
});

// New Author Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author Route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.author_name
  });
  try {
    const newAuthor = await author.save()
    // res.redirect(`authors/${newAuthor.id}`);
    res.redirect(`authors`);
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author"
    });
  }
});

module.exports = router;