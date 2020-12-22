var express = require('express');
var router = express.Router();
var Leave = require('../models/leave');
var Attendance = require('../models/attendance');
var Project = require('../models/project');
var moment = require('moment');
var User = require('../models/user');
var csrf = require('csurf');
var csrfProtection = csrf();
var moment = require('moment');

router.use('/', isLoggedIn, function checkAuthentication(req, res, next) {
    next();
});


/**
 * Description:
 * Displays home page to the employee.
 *

 *
 * Last Updated: 29th November, 2016
 *
 * Known Bugs: None
 */
router.get('/', function viewHome(req, res, next) {
    res.render('Employee/employeeHome', {
        title: 'Home',
        userName: req.session.user.name,
        csrfToken: req.csrfToken()
    });
});

/**
 * Description:
 * Displays leave application form to the user.
 *

 *
 * Last Updated: 27th November, 2016
 *
 * Known Bugs: None
 */

router.get('/apply-for-leave', function applyForLeave(req, res, next) {
    res.render('Employee/applyForLeave', {
        title: 'Apply for Shift',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});

/**
 * Description:
 * Displays the list of all applied laves of the user.
 *

 *
 * Last Updated: 29th November, 2016
 *
 * Known Bugs: None
 */

router.get('/applied-leaves', function viewAppliedLeaves(req, res, next) {
    var leaveChunks = [];

    //find is asynchronous function
    Leave.find({applicantID: req.user._id}).sort({_id: -1}).exec(function getLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i]);
        }

        res.render('Employee/appliedLeaves', {
            title: 'List Of Applied Shifts',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            userName: req.session.user.name
        });
    });

});

/**
 * Description:
 * Displays the attendance to the user.
 *

 *
 * Last Updated: 27th November, 2016
 *
 * Known Bugs: None
 */

router.post('/view-attendance', function viewAttendanceSheet(req, res, next) {
    var attendanceChunks = [];
    Attendance.find({
        employeeID: req.session.user._id,
        month: req.body.month,
        year: req.body.year
    }).sort({_id: -1}).exec(function getAttendance(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            attendanceChunks.push(docs[i]);
        }
        res.render('Employee/viewAttendance', {
            title: 'Attendance Sheet',
            month: req.body.month,
            csrfToken: req.csrfToken(),
            found: found,
            attendance: attendanceChunks,
            moment: moment,
            userName: req.session.user.name
        });
    });


});


/**
 * Description:
 * Display currently marked attendance to the user.
 *

 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-attendance-current', function viewCurrentlyMarkedAttendance(req, res, next) {
    var attendanceChunks = [];

    Attendance.find({
        employeeID: req.session.user._id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    }).sort({_id: -1}).exec(function getAttendanceSheet(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            attendanceChunks.push(docs[i]);
        }
        res.render('Employee/viewAttendance', {
            title: 'Attendance Sheet',
            month: new Date().getMonth() + 1,
            csrfToken: req.csrfToken(),
            found: found,
            attendance: attendanceChunks,
            moment: moment,
            userName: req.session.user.name
        });
    });
});

/**
 * Description:
 * Displays employee his/her profile.
 *

 *
 * Last Updated: 29th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-profile', function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Employee/viewProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });

});

/**
 * Description:
 * Displays the list of all the projects to the Project Schema.
 *

 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-all-projects', function viewAllProjects(req, res, next) {

    var projectChunks = [];
    Project.find({employeeID: req.session.user._id}).sort({_id: -1}).exec(function getProjects(err, docs) {
        var hasProject = 0;
        if (docs.length > 0) {
            hasProject = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            projectChunks.push(docs[i]);
        }
        res.render('Employee/viewPersonalProjects', {
            title: 'List Of Projects',
            hasProject: hasProject,
            projects: projectChunks,
            csrfToken: req.csrfToken(),
            userName: req.session.user.name
        });

    });

});

/**
 * Description:
 * Displays the employee his/her project infomation by
 * getting project id from the request parameters.
 *

 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-project/:project_id', function viewProject(req, res, next) {

    var projectId = req.params.project_id;
    Project.findById(projectId, function getProject(err, project) {
        if (err) {
            console.log(err);
        }
        res.render('Employee/viewProject', {
            title: 'Project Details',
            project: project,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });

    });


});

/**
 * Description:
 * Saves the applied leave application form in Leave Schema.
 *

 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/apply-for-leave', function applyForLeave(req, res, next) {

    var newLeave = new Leave();
    newLeave.applicantID = req.user._id;
    newLeave.title = req.body.title;
    newLeave.type = req.body.type;
    newLeave.startDate = new Date(req.body.start_date);
    newLeave.endDate = new Date(req.body.end_date);
    newLeave.period = req.body.period;
    newLeave.reason = req.body.reason;
    newLeave.appliedDate = new Date();
    newLeave.adminResponse = 'Pending';
    newLeave.save(function saveLeave(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/employee/applied-leaves');
    });

});

/**
 * Description:
 * Marks the attendance of the employee in Attendance Schema
 *

 *
 * Last Updated:
 *
 * Known Bugs: None
 */

router.post('/mark-employee-attendance', function markEmployeeAttendance(req, res, next) {

    Attendance.find({
        employeeID: req.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear()
    }, function getAttendanceSheet(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        else {

            var newAttendance = new Attendance();
            newAttendance.employeeID = req.user._id;
            newAttendance.year = new Date().getFullYear();
            newAttendance.month = new Date().getMonth() + 1;
            newAttendance.date = new Date().getDate();
            newAttendance.present = 1;
            newAttendance.save(function saveAttendance(err) {
                if (err) {
                    console.log(err);
                }

            });
        }
        res.redirect('/employee/view-attendance-current');

    });


});
/*
router.get('/logEntry/:date', function(req, res) {
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

router.get('/logged', function(req, res) {
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
module.exports = router;



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
