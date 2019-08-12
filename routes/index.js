var express = require('express');
var router = express.Router();
const User = require('../models/user')

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /profile
router.get('/profile', function(req, res, next) {
  if (! req.session.userId ) {
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});

// GET /login
router.get('/login', function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        const err = new Error('Credentials do not match')
        err.status = 401;
        return next(err);
      } else {
        // user._id is what we get back from the authenticate method when credentials match
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    const err = new Error('Email and password are required');
    err.status = 401;
    return next(err);
  }
});

// GET /registration
router.get('/register', function(req, res, next) {
  return res.render('register', {title: 'Sign Up'});
});

// POST /registration
router.post('/register', function(req, res, next) {
  if (req.body.email && 
    req.body.name &&
    req.body.favoriteBook &&
    req.body.password &&
    req.body.confirmPassword) {
      
      //confirm that user typed same password twice
      if(req.body.password !== req.body.confirmPassword) {
        const err = new Error('Passwords do not match');
        err.status = 400;
        return(next(err));
      }

      // create object with form input
      const userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      }

      // user schema's create method to insert userData into mongoDB
      User.create(userData, (error, user) => {
        if (error) {
          return next(error);
        } else {
          // when user signs up they are automatically logged in
          req.session.userId = user._id;
          return res.redirect('/profile')
        }
      });

    } else {
      const err = new Error('All fields required');
      err.status = 400;
      return(next(err));
    }
});

module.exports = router;
