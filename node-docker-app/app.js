var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('express-flash');
var session = require('express-session');
var mysql = require('mysql');
var connection  = require('./lib/db');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');

var app = express();

//var mysql = require('mysql');
// var connection = mysql.createConnection({
//   host     : "ab3test.cw8kxh7es4kd.us-east-2.rds.amazonaws.com",
//   user     : "admin",
//   password : "admin123",
//   port     : 3306
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({ 
  cookie: { maxAge: 60000 },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}))

app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);


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


// connection.connect(function(err) {
//   if (err) {
//     console.error('Database connection failed: ' + err.stack);
//     return;
//   }

//   console.log('Connected to database.');

//   // connection.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
//   //   if (error) res.send(`Error: ${JSON.stringify(error)}`);
//   //     res.send(`The solution is: ${results[0].solution}`);
//   //   });
    
//     connection.end();
// });



module.exports = app;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var port = 5000;

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});

  