const User = require("../models/user.js");

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.validateSignUp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({
      email,
      username,
    });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (error) => {
      if (error) {
        return next(error);
      }
      req.flash("success", "User registered successfully");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.renderLogInForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.validateLogIn = async (req, res) => {
  req.flash("success", "Welcome Back to StayLocator");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logOutUser = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.flash("success", "Logged Out success");
    res.redirect("/listings");
  });
};
