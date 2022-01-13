const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseHeaderSchema = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model("ResponseHeader", responseHeaderSchema);
