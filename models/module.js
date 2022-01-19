const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
    name: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Module", moduleSchema);
