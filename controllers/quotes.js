const router = require('express').Router()

const Book = require('../models/Book');
const Quote = require('../models/Quote');




//  like

router.post('/:quoteId/like', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.quoteId);
    const userId = req.session.user._id;

    if (!quote.likedBy.includes(userId)) {
      quote.likedBy.push(userId);
      quote.likesCount += 1;
      await quote.save();
    }

    res.redirect('back');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// remove the like

router.post('/:quoteId/unlike', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.quoteId);
    const userId = req.session.user._id;

    if (quote.likedBy.includes(userId)) {
      quote.likedBy.pull(userId);
      quote.likesCount -= 1;
      await quote.save();
    }

    res.redirect('back');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});



module.exports =router;