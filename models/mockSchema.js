const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Header = require('./header')
const QParam = require('./qparam')
const RequestBody = require('./requestBody')
const ResponseHeader = require('./responseHeader')


const mockSchema = new Schema({
    description:String ,
    endPoint: String,
    statusCodes: String,
    contentType: String,
    delay: String,
    httpMethod:String,
    body: String,
    headers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Header'
        }
    ],
    qparams:[

        {
            type: Schema.Types.ObjectId,
            ref: 'QParam'

        }
    ],
    requestBody:[
       {
           type: Schema.Types.ObjectId,
           ref: 'RequestBody' 
       }

    ],
    responseHeaders:[
        {
            type: Schema.Types.ObjectId,
            ref: 'ResponseHeader' 
        }

    ],
    module:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Module' 
        }

    ]
});

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Header.deleteMany({
            _id: {
                $in: doc.headers
            }
        })
    }
})

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await QParam.deleteMany({
            _id: {
                $in: doc.qparams
            }
        })
    }
})

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await RequestBody.deleteMany({
            _id: {
                $in: doc.requestBody
            }
        })
    }
})

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await ResponseHeader.deleteMany({
            _id: {
                $in: doc.responseHeaders
            }
        })
    }
})

module.exports = mongoose.model('mocks', mockSchema);