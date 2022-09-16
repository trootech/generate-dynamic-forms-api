

const {User} = require("../models");
const {Role} = require("../models");
const {RefreshToken} = require("../models");
const { sendEmail } = require("../utils/sendEmail");
const labelmsg = require('../labels/response.labels');
const fs = require("fs");
var Buffer = require('buffer/').Buffer;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup =  (req, res) => {

  let decodedPassword  = Buffer.from(req.body.password, 'base64').toString('ascii')

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(decodedPassword, 8),
  });
  if(req.file){
    let imagestring = req.file.filepath + req.file.filename
    user.profile_image = imagestring
  }

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
       Role.find({ role_name:  req.body.roles },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err , success:true});
              return;
            }

            res.send({ message: labelmsg.register  , success:true});
          });
        }
      );
    } else {
      Role.findOne({ role_name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({message: labelmsg.register  , success:true , data:user });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .exec(async(err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." ,success:false });
      }

      let decodedPassword  = Buffer.from(req.body.password, 'base64').toString('ascii')

      var passwordIsValid = bcrypt.compareSync(
        decodedPassword,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, process.env.secret, {
        expiresIn: parseInt(process.env.tokenExpiration)
      });
      let refreshToken = await RefreshToken.createToken(user)


      var authorities = "ROLE_" + user.roles.role_name.toUpperCase();

      // authorities.push("ROLE_" + user.roles.role_name.toUpperCase());

      res.status(200).send({
        success:true,
        id: user._id,
        name: user.name,
        email: user.email,
        roles: authorities,
        accessToken: token,
        refreshToken: refreshToken,
        profile_image : user.profile_image
      });
    });
};

exports.refreshToken = async(req, res) => {
  const {refreshToken: requestToken} = req.body;
  if(requestToken == null) {
    return res.status(403).json({
      message: "Refresh Token is required!"
    });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });
    if(!refreshToken) {
      res.status(403).json({message: "Refresh token is not in database!"});
      return;
    }
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please login again!",
      });
      return;
    }

    let newAccessToken = jwt.sign({ id: refreshToken._id}, process.env.secret, {
      expiresIn: parseInt(process.env.tokenExpiration)
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token
    });
  }
  catch(err) {
    return res.status(500).send({message: err});
  }
}


exports.UpdateProfileImage = async (req, res) => {
  try{
  const id = req.query.id
    const content = req.body
    const data = {
        _id: id,
        name:content.name,
        email:content.email,
        roles : content.roles
    }
    if(req.file){
    const userdata = await User.findOne({_id:id})
    if(userdata?.profile_image){
      console.log(__dirname);
      // const path = __dirname+"/../public"+userdata.profile_image
      const path = `${__dirname}/../public${userdata.profile_image}`
      console.log(path);
      fs.unlinkSync(path)
    }
    let imagestring = req.file.filepath + req.file.filename
    data.profile_image = imagestring
  }
   let imagedata = await User.findByIdAndUpdate(id, data, {new: true})
    res.status(200).send({
        success: true,
        data: imagedata.profile_image,
        message: 'Profile-info updated successfully',
    })
  }
  catch(err) {
    console.log(err);
    return res.status(500).send({message: err});
  }
};

exports.getProfileinfo = async (req, res) => {
  try {
    const id = req.query.userid
    const data = await User.findById(id);
    if (data <= 0) {
        res.status(404).send({
            success: false,
            message: 'Profile-info data not found'
        })
    }
    else {
        res.status(200).send({
            success: true,
            profile_image: data.profile_image,
            message: 'Profile-info data fetched successfully'
        })
    }
}
catch (err) {
  console.log("err",err);
    res.status(500).send({
        success: false,
        message: 'Profile-info.controller: ' + err.message
    })
}
};


// change user's password
exports.changePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    let decodedPassword = Buffer.from(password, 'base64').toString('ascii');

    const user = await User.findOne({
      email: email,
    });
    const hassedPassword = await bcrypt.hash(decodedPassword, 8);
    if (user) {
      User.updateOne(
        { _id: String(user._id), email: email },
        {
          password: hassedPassword,
        },
        function (err, response) {
          if (err) {
            res.status(500)
              .send("Something went wrong. Please try again!");
          } else {
            res.status(200).json({
              success: true,
              message: "Your Password Changes Successfully",
            });
          }
        }
      );
    } else {
      res.status(404).send({ message: "This email address is not found" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};


exports.removeExpiredToken = async() => {

  try {
    const expiredToken = await RefreshToken.distinct("_id", {"expiryDate": {$lt: new Date()}});
    console.log(expiredToken)
    let removeExToken = await RefreshToken.deleteMany({_id: {$in: expiredToken}})
    if(removeExToken) {
      console.log({message: 'Refresh token removed!'});
      return true;
    } else {
     console.log({message: "Refresh token not remove."});
     return false;
    }
  } catch (error) {
    console.log(error);
  }


  // let entries = await RefreshToken.deleteMany({form_id: mongoose.Types.ObjectId(id)})

}

/* exports.forgetpassword = async(req, res) => {
  // console.log("req : ", req.body);
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(201).json({
        success: false,
        message:
          "The email address " +
          req.body.email +
          " is not associated with any account. Double-check your email address and try again.",
      });

    //Generate and set password reset token
    user.generatePasswordReset();

    // Save the updated user object
    await user.save();

    // send email
    let subject = "Password change request";
    let to = user.email;
    let from = process.env.FROM_EMAIL;
    let link =
      "http://" +
      req.headers.host +
      "/auth/reset/" +
      user.resetPasswordToken;
    console.log("link", link)

    let html = `<p>Hi ${user.email}</p>
                  <p>Please click on the following <a href="${link}">${link}</a> to reset your password.</p>
                  <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

    await sendEmail({ to, from, subject, html });
    res
      .status(200)
      .json({ success: true, message: "A reset email has been sent to " + user.email + "." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reset = async (req, res) => {
  try {
    const { token } = req.params;
    // console.log("req.params",req.params, req.body)

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(401)
        .json({ message: "Password reset token is invalid or has expired." });

    //Redirect user to form with the email address
    res.render('reset', { user });

    // let text = "Forget Password Succesfully";
    // let result = text.bold();
    // res.send(result);

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

exports.resetPassword = async (req, res) => {

  try {
    if (req.body.password !== req.body.confirmPassword) {
      res.render('error', { message: 'Password not match' });
    } else if (req.body.password.length < 6) {
      res.render('error', { message: 'Must be at least 6 chars long' });
    } else {

      const { token } = req.params;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user)
        return res
          .status(401)
          .json({ message: "Password reset token is invalid or has expired." });

      //Set the new password
      // const hassedPassword = await bcrypt.hash(req.body.password, 8);
      // req.body.password = hassedPassword

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.isVerified = true;

      await user.save();
      let subject = "Your password has been changed";
      let to = user.email;
      let from = process.env.FROM_EMAIL;
      let html = `<p>Hi ${user.email}</p>
                  <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`;

      await sendEmail({ to, from, subject, html });

      res.status(200).json({ message: "Your password has been updated." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}; */

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["x-access-token"];
    jwt.sign(authHeader, "", { expiresIn: 1 } , (logout, err) => {
      if (logout) {
      res.send({msg : 'You have been Logged Out' });
      } else {
      res.send({msg:'Error'});
      }
    });
    req.session = null;

  } catch (err) {
    this.next(err);
  }
};
