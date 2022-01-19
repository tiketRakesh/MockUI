const mockDb = require('./models/mockSchema');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/user/login');
    }
    next();
}


module.exports.isAdmin = async (req, res, next) => {
    if ('admin'!= req.user.role) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/`);
    }
    next();
}


module.exports.isAuthor = async (req, res, next) => {
    const { moduleId,id } = req.params;
    mock=''
    try{
        mock = await mockDb.findById(id).populate('author');
    }catch(e){
        req.flash('error', 'Cannot find that mock , Incorrect mockId!');
        return res.redirect('/');
    }
    if ('admin'!= req.user.role && (mock.author.username!=req.user.username)) {
        //req.session.returnTo = req.originalUrl
        req.flash('error', 'You do not have permission to do that!');
        return     res.redirect(`/module/${moduleId}/mock/show/${id}`);
    }
    next();
}