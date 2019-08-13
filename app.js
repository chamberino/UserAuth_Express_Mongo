const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();

// connect mongoDB
mongoose.connect("mongodb://localhost:27017/bookworm", {useNewUrlParser: true});
// db is an object which represents the connection to mongodb
const db = mongoose.connection;
// we can use the db object to add an error handler
// mongo err
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUnitialized: false,
  store: new MongoStore({
    mongooseConnection: db,
  })
}));

// make user ID available in templates
// Locals provides a way for you to add information to the response object
// All views have access to the response's locals object
app.use( (req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
})

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
