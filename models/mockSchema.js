const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Header = require('./header')
const QParam = require('./qparam')
const RequestBody = require('./requestBody')
const ResponseHeader = require('./responseHeader')
const DynamicResponse = require('./dynamicResponse')
const DynamicRequestCallback = require('./dynamicRequestCallback')

const CallBack = require('./callBack')


const mockSchema = new Schema({
    description:String ,
    endPoint: String,
    statusCodes: String,
    contentType: String,
    delay: String,
    httpMethod:String,
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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
    dynamicResponse:[
        {
            type: Schema.Types.ObjectId,
            ref: 'DynamicResponse' 
        }

    ],
    dynamicRequestCallback:[
        {
            type: Schema.Types.ObjectId,
            ref: 'DynamicRequestCallback' 
        }

    ],
    module:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Module' 
        }

    ],
    callBack :[
        {
            type: Schema.Types.ObjectId,
            ref: 'CallBack'   
        }
    ]
});

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await DynamicRequestCallback.deleteMany({
            _id: {
                $in: doc.dynamicRequestCallback
            }
        })
    }
})

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await DynamicResponse.deleteMany({
            _id: {
                $in: doc.dynamicResponse
            }
        })
    }
})

mockSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await CallBack.deleteMany({
            _id: {
                $in: doc.callBack
            }
        })
    }
})

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