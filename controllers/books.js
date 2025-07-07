const router = require('express').Router()

const Book = require('../models/Book');
const Quote = require('../models/Quote');

// API
// using (.populate)option when i have one to many




//read all -index page
router.get('/', async (req,res)=> {
    const books = await Book.find().populate('owner');
    res.render(`books/index.ejs`, {books});
});



// create //get
router.get('/new', async(req,res) =>{
    res.render('books/new.ejs')
});



// create //post
router.post('/', async(req,res) =>{
//it will give the current id of user and assin it to owner
req.body.owner = req.session.user._id;

const newBook = await Book.create(req.body);

    if (req.body.bookQuotes && req.body.bookQuotes.trim() !== '') {
      const Quote = require('../models/Quote');

      await Quote.create({
        QuoteLine: req.body.bookQuotes, 
        book: newBook._id,
        user: req.session.user._id,
      });
    }
res.redirect('/books');

});




// Read one - show page
//  we’ll need to populate() the owner path anytime we wish to display information about an owner beyond an ObjectId.
router.get("/:bookId", async (req,res)=>{
         const myBook = await Book.findById(req.params.bookId).populate('owner');

// use it to display quotes in view
         const bookQuotes = await Quote.find({ book: req.params.bookId }).populate('user');


// The some() array method returns true if at least one element passes the test 
        const userHasFavorited = myBook.favoritedByUser.some((user)=>
        user.equals(req.session.user._id)
    );


    // console.log("userHasFavorited", userHasFavorited)
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
    const currentBook = await Book.findById(req.params.bookId);
    res.render('books/edit.ejs', {
      myBook: currentBook,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});



// PUT - Update - put
// The listingId is correctly passed through req.params.
// The user object is accessible via req.session.
router.put('/:bookId', async (req, res) => {
  try {
    const currentBook = await Book.findById(req.params.bookId);
    if (currentBook.owner.equals(req.session.user._id)) {
      await currentBook.updateOne(req.body);
      res.redirect('/books');
    } else {
      res.send("You don't have permission to do that.");
    }
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