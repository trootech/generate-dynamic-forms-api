const mongoose = require("mongoose");

const FormsEntriesSchema = new mongoose.Schema({
    form_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Forms",
        required: true,
    }    
},{ timestamps: {}});

const FormsEntries = mongoose.model("FormsEntries", FormsEntriesSchema);

module.exports = FormsEntries;