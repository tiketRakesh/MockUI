const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
    name: String
});

module.exports = mongoose.model("Module", moduleSchema);
