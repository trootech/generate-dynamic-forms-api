const mongoose = require("mongoose");

const FormsDataEntriesSchema = new mongoose.Schema({
    form_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Forms",
        required: true,
    },
    field_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fields",
        required: true,
    },
    entry_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FormsEntries",
        required: true,
    },
    value: {
        // type: String,
        type: mongoose.Schema.Types.Mixed,
        required: true,
    }  
},{ timestamps: {}});

const FormsDataEntries = mongoose.model("FormsDataEntries", FormsDataEntriesSchema);

module.exports = FormsDataEntries;