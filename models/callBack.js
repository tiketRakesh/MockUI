const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callBackSchema = new Schema({
    protocol: String,
    host: String,
    port: String,
    path: String,
    headers: String,
    delay: String,
    httpMethod:String,
    requestBody: String
});

module.exports = mongoose.model("CallBack", callBackSchema);
