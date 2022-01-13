const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestBodySchema = new Schema({
    path: String,
    value: String
});

module.exports = mongoose.model("RequestBody", requestBodySchema);
