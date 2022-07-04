const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mockDb = require('./models/mockSchema');
const Callback = require('./models/callBack');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Header = require('./models/header');
const QParam = require('./models/qparam');
const RequestBody = require('./models/requestBody');
const ResponseHeader = require('./models/responseHeader');
const DynamicResponse = require('./models/dynamicResponse');
const DynamicRequestCallback = require('./models/dynamicRequestCallback');
const Module = require('./models/module');
const moduleMockMap = new Map();
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const session = require('express-session');
const { isLoggedIn,isAdmin,isAuthor} = require('./middleware');


/* mongoose.connect('mongodb://root:example@localhost:27017', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}); */

 mongoose.connect('mongodb://localhost:27017/mocks', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true}));
//app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const sessionConfig = {
    secret: 'ticketAutomation!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);

//module related routes
app.get('/',catchAsync(async (req, res) => {
    const modules = await Module.find({});
    for (let i = 0; i < modules.length; i++) {
        module=modules[i];
        const mocks = await mockDb.find({ module: modules[i].id });
        module.length=mocks.length;
    }
    res.render('core/home',{modules})
}));

app.get('/module/new', isLoggedIn,isAdmin,(req, res) => {
    res.render('core/newModule');
})

app.post('/addModule', isLoggedIn,catchAsync(async (req, res) => {
    const module = new Module(req.body.module);
    module.author = req.user._id;
    await module.save();
    req.flash('success', 'Successfully made a new module!');
    res.redirect(`/`)
}));

app.get('/module/:id/edit',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    module='';
    try{
     module = await Module.findById(req.params.id)
    }catch{
        req.flash('error', 'Cannot find that module , Incorrect moduleId!');
        return res.redirect('/');
    }
    res.render('core/editModule', { module });
}));

app.put('/module/:id',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const mock = await Module.findByIdAndUpdate(id, { ...req.body.module });
    req.flash('success', 'Successfully updated the module!');
    res.redirect(`/`)
}));

app.delete('/module/:id',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const mocks = await mockDb.find({ module: req.params.id });
    length= mocks.length
    if(length>0){
        res.render('core/alert',{ length });          
    }else{
        await Module.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted the module!');
        res.redirect(`/`)
    }
}));



//Mock Model related routes 

app.get('/module/:id/mocks', isLoggedIn ,catchAsync(async (req, res) => {
    moduleId = req.params.id;
    module="";
    try{
         module = await Module.findById(moduleId)
    }catch(e){
        req.flash('error', 'Cannot find that module , Incorrect moduleId!');
        return res.redirect('/');
    }
    moduleName=module.name;
    const mocks = await mockDb.find({ module: moduleId }).populate('author');
    res.render('core/index', { mocks ,moduleId,moduleName })
}));

app.get('/module/:id/mock/new', (req, res) => {
    moduleId = req.params.id;
    res.render('core/new',{moduleId});
})

app.post('/module/:id/mock', catchAsync(async (req, res) => {
    const moduleID=req.params.id;
    const mock = new mockDb(req.body.mock);
    const module = await Module.findById(moduleID)
    mock.module.push(module);
    mock.author = req.user._id;
    await mock.save();
    req.flash('success', 'Successfully made a new mock!');
    res.redirect(`/module/${moduleID}/mock/show/${mock._id}`)
}));

app.get('/module/:moduleId/mock/show/:id', catchAsync(async (req, res,) => {
    const moduleId= req.params.moduleId;
    mock='';
    try{
        mock = await mockDb.findById(req.params.id).populate('headers').populate('qparams').populate('requestBody').populate('responseHeaders').populate('module').populate('callBack').populate('dynamicResponse').populate('dynamicRequestCallback')
    }catch(e){
        req.flash('error', 'Cannot find that mock , Incorrect mockId!');
        return res.redirect('/');
    }
    res.render('core/show', { mock ,moduleId});
}));

app.get('/module/:moduleId/mock/:id/edit', isAuthor,catchAsync(async (req, res) => {
    const moduleId= req.params.moduleId;
    mock='';
    try{
     mock = await mockDb.findById(req.params.id)

    }catch(e){
        req.flash('error', 'Cannot find that mock , Incorrect mockId!');
        return res.redirect('/');
    }
    res.render('core/edit', { mock ,moduleId});
}));


app.put('/module/:moduleId/mock/:id', catchAsync(async (req, res) => {
    const { moduleId,id } = req.params;
    const mock = await mockDb.findByIdAndUpdate(id, { ...req.body.mock });
    req.flash('success', 'Successfully updated the  mock!');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));


app.delete('/module/:moduleId/mock/:id', isAuthor,catchAsync(async (req, res) => {
    const { moduleId,id } = req.params;
    const mock = await mockDb.findById(id).populate('module');    
    await mockDb.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the mock!');
    res.redirect(`/module/${moduleId}/mocks`)
}));

//Model realted to callback routs 

app.get('/module/:moduleId/mock/:id/callback', isAuthor,catchAsync(async (req, res) => {
    const moduleId= req.params.moduleId;
    mock='';
    try{
     mock = await mockDb.findById(req.params.id)

    }catch(e){
        req.flash('error', 'Cannot find that mock , Incorrect mockId!');
        return res.redirect('/');
    }
    res.render('core/newCallback', { mock ,moduleId});
}));

app.get('/module/:moduleId/mock/:id/callback/:callbackId/edit', isAuthor,catchAsync(async (req, res) => {
    const moduleId= req.params.moduleId;
    mock='';
    callbackData='';
    try{
     mock = await mockDb.findById(req.params.id)
     callBack = await Callback.findById(req.params.callbackId)

    }catch(e){
        req.flash('error', 'Cannot find that mock , Incorrect mockId!');
        return res.redirect('/');
    }
    res.render('core/editCallback', { mock ,moduleId,callBack});
}));



app.post('/module/:moduleId/mock/:id/callback',isAuthor, catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const callback = new Callback(req.body.callback);
    mock.callBack.push(callback);
    await callback.save();
    await mock.save();
    req.flash('success', 'Successfully added the callback ');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));

app.put('/module/:moduleId/mock/:id/callback/:callbackId', catchAsync(async (req, res) => {
    const {moduleId, id, callbackId } = req.params;
    const mock = await mockDb.findById(id);
    const callback = await Callback.findByIdAndUpdate(callbackId, { ...req.body.callBack});
    req.flash('success', 'Successfully updated the  callback data !');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));

app.delete('/module/:moduleId/mock/:id/callback/:callbackId',isAuthor, catchAsync(async (req, res) => {
    const {moduleId, id, callbackId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { callBack: callbackId } });
    await Callback.findByIdAndDelete(callbackId);
    req.flash('success', 'Successfully deleted the callback data !');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
    
}))


//Model  related to dynamic response   
app.post('/module/:moduleId/mock/:id/dynamicResponse',isAuthor, catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const dr = new DynamicResponse(req.body.dynamicResponse);
    mock.dynamicResponse.push(dr);
    await dr.save();
    await mock.save();
    req.flash('success', 'Successfully added the dynamic response  matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));


app.delete('/module/:moduleId/mock/:id/dynamicResponse/:dynamicResponseId',isAuthor, catchAsync(async (req, res) => {
    const {moduleId, id, dynamicResponseId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { dynamicResponse: dynamicResponseId } });
    await Header.findByIdAndDelete(dynamicResponseId);
    req.flash('success', 'Successfully deleted the dynamic response  matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
    
}))


//Model  related to dynamic request callback   
app.post('/module/:moduleId/mock/:id/dynamicRequestCallback',isAuthor, catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const drc = new DynamicRequestCallback(req.body.dynamicRequestCallback);
    mock.dynamicRequestCallback.push(drc);
    await drc.save();
    await mock.save();
    req.flash('success', 'Successfully added the dynamic request callback matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));


app.delete('/module/:moduleId/mock/:id/dynamicRequestCallback/:dynamicRequestCallbackId',isAuthor, catchAsync(async (req, res) => {
    const {moduleId, id, dynamicRequestCallbackId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { dynamicRequestCallback: dynamicRequestCallbackId } });
    await Header.findByIdAndDelete(dynamicRequestCallbackId);
    req.flash('success', 'Successfully deleted the dynamic request callback matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
    
}))


//Model Header related routing  
app.post('/module/:moduleId/mock/:id/header',isAuthor, catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const header = new Header(req.body.header);
    mock.headers.push(header);
    await header.save();
    await mock.save();
    req.flash('success', 'Successfully added the header matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));


app.delete('/module/:moduleId/mock/:id/header/:headerId',isAuthor, catchAsync(async (req, res) => {
    const {moduleId, id, headerId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { headers: headerId } });
    await Header.findByIdAndDelete(headerId);
    req.flash('success', 'Successfully deleted the header matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
    
}))


//Model QParam  related routing  
app.post('/module/:moduleId/mock/:id/qparam',isAuthor ,catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const qparam = new QParam(req.body.qparam);
    mock.qparams.push(qparam);
    await qparam.save();
    await mock.save();
    req.flash('success', 'Successfully added the query param matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)

}));

app.delete('/module/:moduleId/mock/:id/qparam/:qparamId',isAuthor,catchAsync(async (req, res) => {
    const { moduleId,id, qparamId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { qparams: qparamId } });
    await QParam.findByIdAndDelete(qparamId);
    req.flash('success', 'Successfully deleted  the query param matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
}))


//Model RequestBody related routing  
app.post('/module/:moduleId/mock/:id/requestBody',isAuthor ,catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const requestBody = new RequestBody(req.body.requestBody);
    mock.requestBody.push(requestBody);
    await requestBody.save();
    await mock.save();
    req.flash('success', 'Successfully added the request body matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));

app.delete('/module/:moduleId/mock/:id/requestBody/:pathId',isAuthor ,catchAsync(async (req, res) => {
    const { moduleId,id, pathId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { requestBody: pathId } });
    await RequestBody.findByIdAndDelete(pathId);
    req.flash('success', 'Successfully deleted the request body matcher!');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
}))


//Model Response Header related routing  
app.post('/module/:moduleId/mock/:id/responseHeader',isAuthor,catchAsync(async (req, res) => {
    const moduleId=req.params.moduleId;
    const mock = await mockDb.findById(req.params.id);
    const responseHeader = new ResponseHeader(req.body.responseHeader);
    mock.responseHeaders.push(responseHeader);
    await responseHeader.save();
    await mock.save();
    req.flash('success', 'Successfully added the response header');
    res.redirect(`/module/${moduleId}/mock/show/${mock._id}`)
}));

app.delete('/module/:moduleId/mock/:id/responseHeader/:responseHeaderId', isAuthor,catchAsync(async (req, res) => {
    const { moduleId,id, responseHeaderId } = req.params;
    await mockDb.findByIdAndUpdate(id, { $pull: { responseHeaders: responseHeaderId } });
    await ResponseHeader.findByIdAndDelete(responseHeaderId);
    req.flash('success', 'Successfully deleted the response header');
    res.redirect(`/module/${moduleId}/mock/show/${id}`)
}))

app.all('*', (req, res, next) => {
    req.flash('error', 'cannot find the page!, Incorrect route');
    res.redirect("/");
    next();
    //next(new ExpressError('Page Not Found', 404))
})

/* app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    err.message = 'Page Not Found'
    res.status(statusCode).render('error', { err })
}) */


app.listen(3010, () => {
    console.log('Serving on port 3010')
})
