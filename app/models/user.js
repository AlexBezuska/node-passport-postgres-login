var pg = require('pg');

const config = {
  user: 'node',
  database: 'recipedb',
  password: 'node123',
  port: 5432
};
const userPool = new pg.Pool(config);

function User(){
  this.id = 0;
  this.email = "";
  this.password= "";
  this.save = function(callback) {
    userPool.connect( (err, client, done) =>{

      console.log(this.email +' will be saved');
      client.query('INSERT INTO users(email, password) VALUES($1, $2)', [this.email, this.password],  (err, result) => {
        if(err){
          console.log(err);
          return console.error('error running query', err);
        }
        console.log(result.rows);
      });

      client.query('SELECT * FROM users ORDER BY id desc limit 1', null, (err, result) => {
        if(err){
          return callback(null);
        }
        if (result.rows.length > 0){
          console.log(result.rows[0] + ' is found!');
          var user = new User();
          user.email= result.rows[0]['email'];
          user.password = result.rows[0]['password'];
          user.id = result.rows[0]['id'];
          console.log(user.email);
          done();
          return callback(user);
        }
      });

    });


  };
}




// User.findOne = function(email, callback){
//   var isNotAvailable = false;
//   console.log(email + ' is in the findOne function test');
//
//   userPool.connect( (err, client, done) => {
//     client.query("SELECT * from users where email=$1", [email], (err, result) => {
//       if(err){
//         return callback(err, isNotAvailable, this);
//       }
//       if (result.rows.length > 0){
//         isNotAvailable = true;
//         console.log(email + ' is am not available!');
//       }
//       else{
//         isNotAvailable = false;
//         console.log(email + ' is available');
//       }
//       done();
//       return callback(false, isNotAvailable, this);
//     });
//   });
// };




User.findById = function(id, callback){
  console.log("we are in findbyid");
  userPool.connect( (err, client, done) => {
    client.query("SELECT * from users where id=$1", [id], (err, result) => {

      if(err){
        return callback(err, null);
      }
      if (result.rows.length > 0){
        console.log(result.rows[0] + ' is found!');
        var user = new User();
        user.email= result.rows[0]['email'];
        user.password = result.rows[0]['password'];
        user.id = result.rows[0]['id'];
        console.log(user.email);
        return callback(null, user);
      }
    });
  });
};


User.findOne = function(email, callback){
  var isNotAvailable = false;
  console.log(email + ' is in the findOne function test');
  userPool.connect( (err, client, done) => {
    client.query("SELECT * from users where email=$1", [email], function(err, result){
      if(err){
        return callback(err, isNotAvailable, this);
      }
      if (result.rows.length > 0){
        isNotAvailable = true;
        console.log(email + ' is am not available!');
      } else{
        isNotAvailable = false;
        console.log(email + ' is available');
      }
      client.end();
      return callback(false, isNotAvailable, this);
    });
  });
};



module.exports = User;
