const mongoose = require('mongoose');


module.exports.Forms = require('./forms.model');
module.exports.Fields = require('./fields.model');
module.exports.FormsEntries = require('./formsEntries.model');
module.exports.FormsDataEntriesnew = require('./formsDataEntriesnew.model');
module.exports.User = require('./user.model');
module.exports.Role = require('./role.model');
module.exports.RefreshToken = require('./refreshToken.model');
module.exports.ROLES = ["user", "admin", "moderator"];