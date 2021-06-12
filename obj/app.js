var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongodb = require('mongodb');
var jwt = require('jsonwebtoken');
var crypt = require("bcrypt");
var multer = require("multer");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//设置存储位置
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.url.includes("user") || req.url.indexOf("register") !== -1) {
      cb(null, path.join(__dirname, "public", "upload", "user"));
    } else if (req.url.includes("banner")) {
      cb(null, path.join(__dirname, "public", "upload", "banner"));
    } else {
      cb(null, path.join(__dirname, "public", "upload", "furniture"));
    }
  }
});

var upload = multer({ storage });

var app = express();

app.use(upload.any());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser());

//多资源托管
app.use(express.static(path.join(__dirname, "public", "template")));
app.use("/super", express.static(path.join(__dirname, "public", "admin")));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

let cors = require('cors');

app.use(cors({
  //允许所有前端域名
  "origin": ["http://localhost:8001", "http://127.0.0.1:8848", "http://localhost:8888"],
  "credentials": true,//允许携带凭证
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //被允许的提交方式
  "allowedHeaders": ['Content-Type', 'Authorization', 'token']//被允许的post方式的请求头
}));

//响应客户端
app.all("/api/*", require("./utils/params"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/login", require("./routes/api/login"));
app.use("/api/logout", require("./routes/api/logout"));
app.use("/api/register", require("./routes/api/register"));
app.use("/api/furniture", require("./routes/api/furniture"));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  if (req.url.includes("/api")) {
    //用户端不存在的接口
    res.send({ err: 1, msg: "不存在的接口" });
  } else if (req.url.includes("/admin")) {
    //管理端不存在的接口
    res.render('error');
  } else {
    //资源托管没有对应页面时的处理
    // res.sendFile(path.join(__dirname, "public", "template", "index.html"))
  }
});

module.exports = app;
