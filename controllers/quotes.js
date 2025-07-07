const router = require('express').Router()

const Book = require('../models/Book');
// const Quote = require('../models/Quote');

// controllers/users.js

router.get('/profile', async (req, res) => {
  try {
    console.log('user: ', req.session.user);
    res.send('Profile page');
  } catch (error) {
    console.log(error);
  }
});





module.exports =router;