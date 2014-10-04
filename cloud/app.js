// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var userCon = require('cloud/user.js');
var api = require('cloud/api.js');


var app = express();
var expressLayouts = require('express-ejs-layouts');
var avosExpressCookieSession = require('avos-express-cookie-session');
 

// App全局配置
if (__production)
  app.set('views', 'cloud/views');
else
  app.set('views', 'cloud/views');

app.set('view engine', 'ejs');    // 设置template引擎
app.use(express.bodyParser());    // 读取请求body的中间件
app.use(expressLayouts);
app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});

//启用cookie
app.use(express.cookieParser('zhai che bao bei'));  
//使用avos-express-cookie-session记录登录信息到cookie。
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }}));

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/dash', function(req, res) {
	if (userCon.isLogin()){
		res.render('dash', {user: AV.User.current()});
	}else{
		res.redirect('/');
	}
});

app.post('/login', userCon.login);

app.use('/api', function(req,res,next){
	console.log('hey api!');
	if (userCon.isLogin()){
		next();
	}else{
		res.redirect('/');
	}
});
app.get('/api/user/name/:name', userCon.findUserByName)

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
