import Book from "../models/bookModel.js";

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ name: 1 });
    return res.status(200).json({ books });
  } catch (error) {
    console.log(error);
  }
};

export const getPaginatedBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const offset = page * limit;

  const totalRows = await Book.count({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { publisher: { $regex: search, $options: "i" } },
      { year: { $regex: search, $options: "i" } },
    ],
  })
    .sort({ name: 1 })
    .exec();

  const totalPages = Math.ceil(totalRows / limit);

  try {
    const books = await Book.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { publisher: { $regex: search, $options: "i" } },
        { year: { $regex: search, $options: "i" } },
      ],
    })
      .limit(limit)
      .skip(offset)
      .sort({ name: 1 })
      .exec();
    res.status(200).json({ page, totalRows, totalPages, books });
  } catch (error) {
    res.status(404).json(error);
  }
};

export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Book not found",
    });
  }
};

export const addBook = async (req, res) => {
  const book = new Book(req.body);

  try {
    if (
      !book.name ||
      !book.category ||
      !book.author ||
      !book.publisher ||
      !book.year
    ) {
      res.status(400).json({
        status: 400,
        message:
          "Validation error: Book validation failed. Required name, categoty, author, publisher, and year",
      });
      return;
    }

    const newBook = await book.save();
    res.status(201).json({
      status: 201,
      message: "Book saved successfully",
      data: newBook,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateBook = async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  if (!id) {
    res.status(404).json({
      status: 404,
      message: "Book not found",
    });
    return;
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate({ _id: id }, body);

    if (!updatedBook) {
      res
        .status(501)
        .json({ status: 501, message: "Edit book failed. Not implemented" });

      return;
    }

    res.status(200).json({
      status: 200,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteBook = async (req, res) => {
  const {
    params: { id },
  } = req;

  if (!id) {
    res.status(400).json({
      status: 400,
      message: "Validation error: Params _id is not defined",
    });
    return;
  }

  try {
    const deletedBook = await Book.findByIdAndRemove(id);

    if (!deletedBook) {
      res.status(501).json({
        status: 501,
        message: "Remove book failed. Not implemented",
      });

      return;
    }
    res.status(200).json({
      message: "Success deleted book",
      data: deletedBook,
    });
  } catch (error) {
    console.log(error);
  }
};
