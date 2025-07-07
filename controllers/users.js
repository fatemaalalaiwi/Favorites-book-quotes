const router = require('express').Router()

const Book = require('../models/Book');


router.get('/profile', async (req, res) => {
  try {
    const myListings = await Book.find({
      owner: req.session.user._id,
    }).populate('owner');

    const myFavoriteListings = await Book.find({
      favoritedByUser: req.session.user._id,
    }).populate('owner');

    // console.log('myListings:', myListings);
    // console.log('myFavoriteListings:', myFavoriteListings);
    // res.send('Profile page');

    res.render('users/show.ejs', {
         myListings,
         myFavoriteListings,
        });
        
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


module.exports = router;