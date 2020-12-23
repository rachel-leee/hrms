var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var session= require('express-session');
var passport= require('passport');
var flash= require('connect-flash');
var MongoStore= require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var employee = require('./routes/employee');
var manager = require('./routes/manager');

expressValidator = require('express-validator');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/HRMS', {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

require('./config/passport.js');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//validator should be ater body parser
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysupersecret', resave: false, saveUninitialized: false, store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie:{maxAge: 180*60*1000},
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/manager', manager);
app.use('/employee', employee);


app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.messages=req.flash();
  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//testing 
/*

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connected');
});
app.get('/logEntry/:date', function(req, res) {
  if (req.isAuthenticated()) {
    const now = req.params.date;
    const nowDayTime = now.substring(0, 25);
    const timeZone = now.substring(25, now.length);
    const rawNow = Date.now();
    const post = new Post({
      username: nameUser,
      entryDayTime: nowDayTime,
      entryTimeZone: timeZone,
      rawEntry: rawNow,
      complete: false
    });
    post.save(function(err) {
      if (err) {
        console.log(err);
      }
      res.redirect('/logged');
    });
  } else {
    res.redirect('/');
  }
});

app.get('/logExit/:date', function(req, res) {
  if (req.isAuthenticated()) {
    const now = req.params.date;
    const nowDayTime = now.substring(0, 25);
    const timeZone = now.substring(25, now.length);
    const rawNow = Date.now();

    function convertMS(milliseconds) {
      var day, hour, minute, seconds;
      seconds = Math.floor(milliseconds / 1000);
      minute = Math.floor(seconds / 60);
      seconds = seconds % 60;
      hour = Math.floor(minute / 60);
      minute = minute % 60;
      day = Math.floor(hour / 24);
      hour = hour % 24;
      function pad(n) {
        return n < 10 ? '0' + n : n;
      }

      return {
        day: pad(day),
        hour: pad(hour),
        minute: pad(minute),
        seconds: pad(seconds)
      };
    }

    Post.find({ username: nameUser }).exec(function(err, doc) {
      if (err) {
        console.log(err);
      }
      const obj = doc[doc.length - 1];
      let dur = convertMS(rawNow - obj.rawEntry);
      const timeStr = dur.hour + ':' + dur.minute + ':' + dur.seconds;

      Post.findOneAndUpdate(
        { _id: obj._id },
        {
          $set: {
            exitDayTime: nowDayTime,
            rawExit: rawNow,
            complete: true,
            duration: timeStr
          }
        },
        { new: true } // return updated post
      ).exec(function(err, post) {
        if (err) {
          console.log(err);
        }
        res.redirect('/');
      });
    });
  } else {
    res.redirect('/');
  }
});

app.get('/logged', function(req, res) {
  if (req.isAuthenticated()) {
    User.findOne({ username: username }).exec(function(err, doc) {
      if (doc.isAdmin === true) {
        Post.find().exec(function(err, doc) {
          res.render('all-entries', {
            finalDoc: doc,
            username: username
          });
        });
      } else {
        Post.find({ username: username }).exec(function(err, doc) {
          const finalDoc = doc;
          if (err) {
            console.log("poop");
            console.log(err);
          } else if (Array.isArray(doc) && doc.length) {
            const arr = doc[doc.length - 1];
            Post.findById(arr._id, function(err, doc) {
              if (err) {
                console.log("here");
                console.log(err);
              } else if (doc.complete === true) {
                res.render('loggedFull', {
                  username: username,
                  finalDoc: finalDoc
                });
              } else {
                res.render('logged', {
                  username: username,
                  finalDoc: finalDoc
                });
              }
            });
          } else {
            // array is empty
            res.render('loggedFull', {
              username: username,
              finalDoc: finalDoc
            });
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
});
*/
module.exports = app;
