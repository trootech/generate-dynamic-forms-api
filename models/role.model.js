const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const RoleSchema = new mongoose.Schema({
  role_name: {
    type: String,
  },

});

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;