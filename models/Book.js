const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({

Author: {
    type: String,
    required: true
  },

bookImage: {
    type: String
  },

  BookName: {
   type: String
  },

  bookQuotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }],

//   one to many relation
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
//   many to many relation
  favoritedByUser:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  ]
});

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;


