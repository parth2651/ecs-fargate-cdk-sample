// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// // Database
// // var mongo = require('mongodb');
// //var monk = require('monk');
// //const db = require('monk')('ab3test.cw8kxh7es4kd.us-east-2.rds.amazonaws.com')// var db = monk('localhost:27017/nodetest2');

// var mysql = require('mysql');

// var connection = mysql.createConnection({
//   host     : "ab3test.cw8kxh7es4kd.us-east-2.rds.amazonaws.com",
//   user     : "admin",
//   password : "admin123",
//   port     : 3306
// });

// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));


// // Make our db accessible to our router
// // app.use(function(req,res,next){
// //   req.db = db;
// //   next();
// // });

// connection.connect(function(err) {
//   if (err) {
//     console.error('Database connection failed: ' + err.stack);
//     return;
//   }

//   console.log('Connected to database.');
// });

// connection.end();
// console.log('working till here');

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;



var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Database
// var mongo = require('mongodb');
// var monk = require('monk');
// var db = monk('localhost:27017/nodetest2');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : "ab3test.cw8kxh7es4kd.us-east-2.rds.amazonaws.com",
  user     : "admin",
  password : "admin123",
  port     : 3306
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');


app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');


app.get('/', function(req, res){
    res.render('index');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// // Make our db accessible to our router
// app.use(function(req,res,next){
//     req.db = db;
//     next();
// });

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;