const mongoose = require("mongoose");
// const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

mongoose.Promise = global.Promise;
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
 email: {
    type: String,
    required: true
  },
 password: {
    type: String,
    required: true
  },
 roles: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  profile_image:{
    type: String
  }
  // isVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  // resetPasswordToken: {
  //   type: String,
  //   required: false,
  // },

  // resetPasswordExpires: {
  //   type: Date,
  //   required: false,
  // },
},
{
  timestamps: true
});


//Function to handleEvent of password modification
// UserSchema.pre('save', function (next) {
//   var user = this;

//   if (!user.isModified('password')) return next();

//   bcrypt.hash(user.password, null, null, function (err, hash) {
//     if (err) return next(err);

//     user.password = hash;
//     next();
//   });
// });



//Function to check if modified and saved passwords match
// UserSchema.methods.comparePassword = function (password) {
//   return bcrypt.compareSync(password, this.password);
// };

// UserSchema.methods.generatePasswordReset = function () {
//   this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
//   this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
// };


//Function to Use gravatar Service for image Sizes
// UserSchema.methods.gravatar = function (size) {
//   if (!this.size) size = 200;
//   if (!this.email) {
//     return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
//   } else {
//     var md5 = crypto.createHash('md5').update(this.email).digest('hex');
//     return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro';
//   }

// }

const User = mongoose.model("User", UserSchema);

module.exports = User;