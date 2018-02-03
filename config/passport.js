var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var pg = require('pg');


// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    console.log(user.id +" was seralized");
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    console.log(id + "is deserialized");
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {

    process.nextTick(function(callback) {
      User.findOne(email, function(err, isNotAvailable, user) {
        if (err){
          return done(err);
        }
        if (isNotAvailable == true) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          console.log('new local user');
          user = new User();
          user.email = req.body.email;
          user.password = req.body.password;
          user.save(function(newUser) {
            console.log("the object user is: ", newUser);
            passport.authenticate();
            return done(null, newUser);
          });
        }
      });
    });
  }));


  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' :  email }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }
      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      }
      return done(null, user);
    });
  }));
};
