 const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  form_name: {
    type: String,
    required: true,
  },
  form_key: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: Boolean,
    default: true,
  },
  submitButtonName: {
    type: String,
    required: true,
  }, 
  form_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "FormsDataEntriesnew",
  },
  fields_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fields",
    required: true,
  }],  
},{ timestamps: {}}
);

const Forms = mongoose.model("Forms", FormSchema);

module.exports = Forms;