const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const qparamSchema = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model("QParam", qparamSchema);
