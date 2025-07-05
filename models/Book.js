const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({

Author: {
    type: String,
    required: true
  },

bookImage: {
    type: String
  },

  Owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  bookQuotes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quetes'
  },
    size: {
    type: Number,
    required: true,
    min: 0
  },
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


