var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);


router.get('/signup', function signUp(req, res, next) {

    var messages = req.flash('error');
    res.render('signup', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/signup',
    failureRedirect: '/signup',
    failureFlash: true,
}));

router.get('/', function viewLoginPage(req, res, next) {
    var messages = req.flash('error');

    res.render('login', {
        title: 'Log In',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});


router.get('/logout', isLoggedIn, function logoutUser(req, res, next) {

    req.logout();
    res.redirect('/');
});


router.get('/dummy', function (req, res, next) {
    var userChunks = [];
    var chunkSize = 3;
    //find is asynchronous function
    User.find({type: 'employee'}, function (err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        res.render('dummy', {title: 'Dummy', users: userChunks});
    });

});

/**
 * Description:
 * Checks which type of user has logged in to the system
 *

 *
 * Last Updated: 26th November, 2016
 *
 * Known Bugs: None
 */

router.get('/check-type', function checkTypeOfLoggedInUser(req, res, next) {
    req.session.user = req.user;
    if (req.user.type == "project_manager") {
        res.redirect('/manager/');
    }
    else if (req.user.type == "accounts_manager") {
        res.redirect('/manager/');
    }
    else if (req.user.type == "employee") {
        res.redirect('/employee/');
    }
    else {
        res.redirect('/admin/');
    }

});



router.post('/login', passport.authenticate('local.signin', {
    successRedirect: '/check-type',
    failureRedirect: '/',
    failureFlash: true

}));

module.exports = router;

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

exports.forgotpasswordResponse = function(req, res, next) {  

    var input=req.body;  
    //console.log(input);  
    async.waterfall([  
        function(done) {  
            crypto.randomBytes(20, function(err, buf) {  
                var token = buf.toString('hex');  
                done(err, token);  
            });  
        },  
        function(token, done) {  
            MongoClient.connect(url, function(err, db){   
                var dbo = db.db("Here is your DB Name");  
                //console.log(req.body.Email);  
                var query = { Email : req.body.Email };  
                dbo.collection('CLC_User').find(query).toArray(function(err,result){  
                    if(result.length == 0){  
                        req.flash('error', 'No account with that email address exists.');  
                    }  
                    var myquery = { Email: result[0].Email };  
                    var newvalues = { $set: {resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 }};  
                    dbo.collection("CLC_User").updateOne(myquery, newvalues, function(err, res) {  
                        if (err) throw err;  
                        console.log("1 document updated");  
                    });  


                   // console.log(result[0].Email);  
                    done(err, token, result);  
                });  
            });  
        },  
        function(token, result, done,Username,password) {  
            var emailVal = result[0].Email;  
            console.log(emailVal);  
            var Username="";  
            var password="";  
            MongoClient.connect(url, function(err, db){   
            var dbo = db.db("Here will be your db name");  
            dbo.collection('Accountsettings').find().toArray(function(err,result){  
                if (err) throw err;  
                Username=result[0].UserName;  
                password=result[0].Password;  
               // console.log(Username);  
               // console.log(password);  
                   // res.json({status : 'success', message : 'Records found', result : result});  


            // console.log(Username);  
            var smtpTransport = nodemailer.createTransport({  
                service: 'SendGrid',  
                auth: {  
                  user: 'leeyhrachel@gmail.com',  
                  pass: passwordpassword  
                }  
              });  

            const mailOptions = {  
                to: emailVal,  
                from: 'admin@mail.com',  
                subject: 'Node.js Password Reset',  
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +  
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +  
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +  
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'  
            };  
            smtpTransport.sendMail(mailOptions, function(err) {                 
                console.log("HI:"+emailVal);  
                res.json({status : 'success', message : 'An e-mail has been sent to ' + emailVal + ' with further instructions.'});              
                done(err, 'done');  
            });  
        })  
        });  
        }  

    ], function(err) {  
        if (err) return next(err);  

    });  
};

exports.resetpasswordResponse = function(req, res) {  
    console.log("welcome");  
    MongoClient.connect(url, function(err, db){  
        var dbo = db.db("Here is you db");  
        dbo.collection('CLC_User').findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {  
            if (!user) {  
                res.json({message: 'Password reset token is invalid or has expired.'});  
            }else{  
                console.log("coming");  
                fs.readFile("api/Controllers/resetpassword.html", function (error, data) {  
                    console.log("its working");  
                    if (error) {  
                        console.log(error);  
                        res.writeHead(404);  
                        res.write('Contents you are looking are Not Found');  
                    } else {  
                        //res.writeHead(200, { 'Content-Type': 'text/html' });  
                        res.write(data);  
                    }  
                    res.end();  
                });  
            }  
        });  
    });  
};

exports.setpasswordResponsemail = function(req, res) {  
    async.waterfall([  
        function(done) {  
            MongoClient.connect(url, function(err, db){  
                var dbo = db.db("Your Db name goes here");   
                dbo.collection('CLC_User').findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {  
                    if (!user) {  
                        res.json({message: 'Password reset token is invalid or has expired.'});  
                    }  
                    //console.log(user);  
                    var myquery = { resetPasswordToken: req.params.token };  
                    var newvalues = { $set: {Password: req.body.Password,resetPasswordToken: undefined, resetPasswordExpires: undefined, modifiedDate : Date(Date.now()) }};  
                    dbo.collection("CLC_User").updateOne(myquery, newvalues, function(err, result) {  
                        if (err) throw err;  
                        //console.log("result ======" + result);  
                        console.log("1 document updated");  
                    });  
                    done(err, user);  
                });  
            });  
        },  
        function(user, done) {  
            MongoClient.connect(url, function(err, db){   
                var dbo = db.db("Your db name goes here");  
                var Username="";  
                var password="";  
                dbo.collection('Accountsettings').find().toArray(function(err,result){  
                    if (err) throw err;  
                    Username=result[0].UserName;  
                    password=result[0].Password;  
                })  
            })  
            var smtpTransport = nodemailer.createTransport({  
                service: 'SendGrid',  
                auth: {  
                    user: 'leeyhrachel@gmail.com',  
                    pass: passwordpassword  
                }  
            });  
            var mailOptions = {  
                to: user.Email,  
                from: 'admin@mail.com',  
                subject: 'Your password has been changed',  
                text: 'Hello,\n\n' +  
                    'This is a confirmation that the password for your account ' + user.Email + ' has just been changed.\n'  
            };  
            smtpTransport.sendMail(mailOptions, function(err) {  
                res.json({status : 'success', message : 'Success! Your password has been changed.'});  
                done(err);  
            });  
        }  
    ], function(err) {  
        if (err) return err;  
    });  
} 

