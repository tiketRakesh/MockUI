const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const headerSchema = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model("Header", headerSchema);
