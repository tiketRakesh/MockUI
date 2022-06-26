const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dynamicRequestCallbackSchema = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model("DynamicRequestCallback", dynamicRequestCallbackSchema);
