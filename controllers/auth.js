const router = require('express').Router();
const User = require ('../models/user');
const bcrypt = require ('bcrypt');

//sign-app new(get)
router.get("/sign-up",(req,res)=> {
res.render('auth/sign-up.ejs');

});

//sign-up (create)(post)
router.post("/sign-up", async (req, res )=>{
  const userInDatabase = await User.findOne({ username: req.body.username});
  if(userInDatabase) {
    return res.send("Username already taken");
  }

  //mean that the user not in the DB
  if(req.body.password !== req.body.confirmPassword){
    return res.send("Password and confirm password must match")
  }
// even if two users have the exact same passwords, we end up with different encrypted strings in the database.
  //10 the number of round/ The number 10 in the hashSync method represents the amount of salting we want the hashing function to execute: the higher the number, the harder it will be to decrypt the password.
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;
  // Create a User
  const user = await User.create(req.body);
  res.send(`Thanks for signing up ${user.username}`);
});



// we finish from sign up and now we will do sign in

router.get("/sign-in",(req,res)=> {
res.render('auth/sign-in.ejs');

});


router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username});
  if(!userInDatabase){
    return res.send("Login Failed. Please try again later");
  }
  // There is a user! Time to test their password with bcrypt
  const validPassword = bcrypt.compareSync(
    req.body.password, 
    userInDatabase.password
  );

  if(!validPassword){
    return res.send("Login Failed. Please try again later");
  }
  // if valid
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  };
  res.redirect("/");
})



router.get('/sign-out', (req,res)=>{
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;