const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const pg = require("pg");

const config = {
  user: 'node',
  database: 'recipedb',
  password: 'node123',
  port: 5432
};
const pool = new pg.Pool(config);


module.exports = function(passport) {

  pool.connect( (err, client, done) => {

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      client.query("SELECT * FROM users WHERE id = $1 ",[id], (err, res) => {
        done(err, res.rows[0]);
      });
    });


    passport.use(
      'local-signup',
      new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
      },
      (req, email, password, done) => {
        console.log("SIGNUP ATTEMPT WITH",email, password);

        client.query("SELECT * FROM users WHERE email=$1", [email], (err, res) => {
          if (err) {
            return done(err);
          }
          if (res.rows.length) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            var newUser = {
              username: email,
              password: bcrypt.hashSync(password, null, null)
            };
            client.query('INSERT INTO users(email, password) VALUES($1, $2)', [ newUser.username, newUser.password ], (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log("added the new user:", email);

                client.query("SELECT * FROM users WHERE email=$1", [email], (err, res) => {
                  newUser.id = res.rows[0].id;
                  return done(null, newUser);
                });
              }
            });
          }
        });
      })
    );


    passport.use(
      'local-login',
      new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
      },
      (req, email, password, done) => {
        client.query("SELECT * FROM users WHERE email=$1",[email], (err, res) => {
          if (err){
            return done(err);
          }
          if (!res.rows.length) {
            return done(null, false, req.flash('loginMessage', 'No user found.'));
          }
          if (!bcrypt.compareSync(password, res.rows[0].password)) {
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
          }
          return done(null, res.rows[0]);
        });
      })
    );

  }); // end pool.connect

}; // end module.exports
