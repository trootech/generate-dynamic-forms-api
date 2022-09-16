const mongoose = require("mongoose");

const FormsDataEntriesSchema = new mongoose.Schema({
    form_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Forms",
        required: true,
    },
  
    entry_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FormsEntries",
        required: true,
    },
    is_visible_in_entery: {
        type: Array
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    }  
},{ timestamps: {}});

const FormsDataEntriesnew = mongoose.model("FormsDataEntriesnew", FormsDataEntriesSchema);

module.exports = FormsDataEntriesnew;