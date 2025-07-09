const router = require('express').Router()


const multer = require('multer');
const path = require('path');

// تحديد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // داخل مجلد public
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });


const Book = require('../models/Book');
const Quote = require('../models/Quote');

// API
// using (.populate)option when i have one to many (bring the owner of each book)

//read all -index page
router.get('/', async (req,res)=> {
    const books = await Book.find().populate('owner');
    res.render(`books/index.ejs`, {books});
});



// create //get
router.get('/new', async(req,res) =>{
    res.render('books/new.ejs')
});




// post new book and also Quotes
// 'bookImage' is the name in the form
router.post('/', upload.single('bookImage'), async (req, res) => {
  try {
    const { BookName, Author } = req.body;

    // to store the image in DB
    const bookImage = req.file ? 'uploads/' + req.file.filename : '';
   //for new book
    const newBook = new Book({
      BookName,
      Author,
      bookImage,
      owner: req.session.user._id
    });

    await newBook.save();

// .trim() // removed all spacedd before and after the line
    if (req.body.bookQuotes && req.body.bookQuotes.trim() !== '') {
      const Quote = require('../models/Quote');

      // for new Quote
      const newQuote = await Quote.create({
        QuoteLine: req.body.bookQuotes, 
        book: newBook._id,
        user: req.session.user._id,
      });

      // link the book with quote
      newBook.bookQuotes.push(newQuote._id);
      await newBook.save();
    }

    res.redirect('/books');
  } catch (err) {
    console.error('Error adding book:', err);

  }
});



// Read one - show page
// This finds a specific book in the database using the ID
//  we’ll need to populate()  display information about an owner beyond an ObjectId.
router.get("/:bookId", async (req,res)=>{
         const myBook = await Book.findById(req.params.bookId).populate('owner');

// use it to display quotes in view
// it searches the database for all quotes that are linked to a specific book
         const bookQuotes = await Quote.find({ book: req.params.bookId }).populate('user');


// The some() array method returns true if at least one element passes the test (search in the DB)
        const userHasFavorited = myBook.favoritedByUser.some((user)=>
        // Check if the currently logged-in user is in the list of users who favorited this book
          user.equals(req.session.user._id)
    );


    
    res.render('books/show.ejs', {myBook,
       userHasFavorited,
        bookQuotes,
         user: req.session.user });

});





// Delete
// deleteOne() removes that document from the database
router.delete('/:bookId', async (req, res) => {
  try {
    const myBook = await Book.findById(req.params.bookId);
  // delete the book only if the current user is the owner of the book.
    if (myBook.owner.equals(req.session.user._id)) {
      await myBook.deleteOne();
      res.redirect('/books');
    } else {
      res.send("You don't have permission to delete that.");
    }
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});


// PUT - Update -get
router.get('/:bookId/edit', async (req, res) => {
  try {
    // it will finds the book in the database by using the bookId 
    const currentBook = await Book.findById(req.params.bookId);
    res.render('books/edit.ejs', {
      book: currentBook,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});



// PUT - Update - put
// The listingId is correctly passed through req.params.
// The user object is accessible via req.session.
router.put('/:bookId',upload.single('bookImage') ,async (req, res) => {
  try {
    const currentBook = await Book.findById(req.params.bookId);
    
    if (currentBook.owner.equals(req.session.user._id)) {
      await currentBook.updateOne(req.body);
      res.redirect('/books');
    } else {
      res.send("You don't have permission to do that.");
    }
       
    const updateData = {
      BookName: req.body.BookName,
      Author: req.body.Author,
    };
    if (req.file) {
      updateData.bookImage = 'uploads/' + req.file.filename;
    }

    // this will do the update booke from DB with new info
    await Book.findByIdAndUpdate(req.params.bookId, updateData, { new: true });

    
    // res.redirect(`/books/${req.params.bookId}`);
    res.redirect('/books')

  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


// PUT - Update - post(favorited by)
// The $push operator is used to add a new value to an array
router.post('/:bookId/favorited-by/:userId', async (req,res)=>{
    await Book.findByIdAndUpdate(req.params.bookId, {
      $push:{favoritedByUser: req.params.userId}
}) ;
res.redirect(`/books/${req.params.bookId}`);
});


// delete (favorite)

router.delete('/:bookId/favorited-by/:userId', async (req,res)=>{
    await Book.findByIdAndUpdate(req.params.bookId, {
    $pull:{favoritedByUser: req.params.userId}
});


res.redirect(`/books/${req.params.bookId}`);
});



module.exports =router;