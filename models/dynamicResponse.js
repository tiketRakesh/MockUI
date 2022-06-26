const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dynamicResponseSchema = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model("DynamicResponse", dynamicResponseSchema);
