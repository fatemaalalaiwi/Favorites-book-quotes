const router = require('express').Router()
const multer = require('multer');


const path = require('path');

// تحديد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // داخل مجلد public
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // اسم فريد
  }
});
const upload = multer({ storage: storage });


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




// post new book and also Quotes
router.post('/', upload.single('bookImage'), async (req, res) => {
  try {
    const { BookName, Author } = req.body;

    // to store the image in DB
    const bookImage = req.file ? 'uploads/' + req.file.filename : '';

    const newBook = new Book({
      BookName,
      Author,
      bookImage,
      owner: req.session.user._id
    });

    await newBook.save();

    if (req.body.bookQuotes && req.body.bookQuotes.trim() !== '') {
      const Quote = require('../models/Quote');

      // إنشاء اقتباس جديد
      const newQuote = await Quote.create({
        QuoteLine: req.body.bookQuotes, 
        book: newBook._id,
        user: req.session.user._id,
      });

      // ربط الاقتباس بالكتاب
      newBook.bookQuotes.push(newQuote._id);
      await newBook.save();
    }

    res.redirect('/books');
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).send('Something went wrong while adding the book.');
  }
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

    // إذا رفعت صورة جديدة، ضفها
    if (req.file) {
      updateData.bookImage = 'uploads/' + req.file.filename;
    }

    // نفذ التحديث
    await Book.findByIdAndUpdate(req.params.bookId, updateData, { new: true });

    // إعادة التوجيه لصفحة تفاصيل الكتاب
    res.redirect(`/books/${req.params.bookId}`);


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