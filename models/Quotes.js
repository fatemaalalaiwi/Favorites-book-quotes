
const quoteSchema = new mongoose.Schema({


  QuoteLine: { 
    type: String,
    required: true 
     },

  user: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true
     },

  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book',
    required: true 
     },

  likesCount: {
     type: Number,
      default: 0 
    },

  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;


