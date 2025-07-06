const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();


// Middlewares
const mongoose = require("mongoose");// dB
const methodOverride = require("method-override");//apbate and delete
const morgan = require("morgan");
const session = require("express-session");
const passUserToView = require('./middleware/pass-user-to-view');// authentication
const isSignedIn = require('./middleware/is-signed-in');


// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan('dev'));

// Session Configurations

//secret key
// Session Configurations
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passUserToView);

// GET (index page)
app.get("/", async(req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});
// Require Controller to link with server.js // we export it from auth.js file in controllers folder
// Express will now funnel any requests starting with /auth to the authController
const authController = require("./controllers/auth");
app.use("/auth", authController);

const BookController = require("./controllers/books");
app.use("/books",isSignedIn,BookController );

const QuotesController = require("./controllers/quotes");
app.use("/quotes",isSignedIn,QuotesController );



app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});