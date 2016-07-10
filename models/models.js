var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')

// Create a connect.js inside the models/ directory that
// exports your MongoDB URI!
var connect = process.env.MONGODB_URI || require('./connect');

// If you're getting an error here, it's probably because
// your connect string is not defined or incorrect.
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  facebookId: { //store facebook id here
    type: String,
    required: true
  },
  routine:
    {
      name: String
    }
  ,
  timeToWakeUP: {
    type: String
  }
});
userSchema.plugin(findOrCreate);
module.exports = {User: mongoose.model('User', userSchema)};
