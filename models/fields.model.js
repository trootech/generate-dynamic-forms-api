const mongoose = require("mongoose");

const FieldsSchema = new mongoose.Schema({
  field_label: {
    type: String,
    required: true,
  },
  field_name: {
    type: String,
    required: true,
  },
  field_type: {
    type: String,
    required: true,
  },
  iseditable: {
    type: Boolean,
    default: true,
  },
  isvisibletolist: {
    type: Boolean,
    default: false,
  },
  is_visible_in_entery: {
    type: Boolean,
    default: true,
  },
  field_values: [],
  validation: {}
},{ timestamps: {}});

const Fields = mongoose.model("Fields", FieldsSchema);

module.exports = Fields;