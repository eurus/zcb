// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var userCon = require('cloud/user.js');

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
app.get('/operator', function(req, res) {
	url = req.param('url') || ''
	res.render('operator', {url: url});
});

app.get('/', function(req, res) {
	res.render('weixin', {layout:'index-layout'});
	// res.render('index', {layout:'index-layout'});
});

app.get('/index', function(req,res){
	res.render('index', {layout:'index-layout'});
});

app.get('/man',function(req,res) {
		if (userCon.isLogin()){
		userCon.findUserById(AV.User.current().id).then(function(user){
			console.log(user);
			res.render('mancheck', {user: user});
		}, function(){
			res.redirect('/man');
		})
	}else{
		res.redirect('/operator?url=/man');
	}
});

app.get('/app/download', function(req, res){
	res.redirect('/');
});

app.get('/app/download/android', function(req, res){
	agent = req.headers['user-agent']
	console.log(agent);
	if (agent.indexOf('MicroMessenger') > 0){
		res.render('android-weixin', {layout:'index-layout'});
	}else{
		var Android = AV.Object.extend("Application");
		var query = new AV.Query(Android);
		query.equalTo("type", "android");
		query.first({
			success: function(object) {
				console.log(object.get("url"));
				var url = object.get("url");
				res.redirect(url);
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
		
	}
});

app.get('/app/download/ios', function(req, res){
	var IOS = AV.Object.extend("Application");
	var query = new AV.Query(IOS);
	query.equalTo("type", "ios");
	query.first({
		success: function(object) {
			console.log(object.get("url"));
			var url = object.get("url");
			res.render('ios', {url:url});
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});

app.get('/chat', function(req, res) {
	if (userCon.isLogin()){
		userCon.findUserById(AV.User.current().id).then(function(user){
			console.log(user);
			res.render('chat', {user: user});
		}, function(){
			res.redirect('/operator');
		})
	}else{
		res.redirect('/operator');
	}
});

app.get('/orders', function(req, res){
	if (userCon.isLogin()){
		res.render('orders', {user:AV.User.current()});
	}else{
		res.redirect('/operator?url=/orders');
	}
});

app.get('/data', function(req, res){
	if (userCon.isLogin()){
		res.render('data', {user:AV.User.current()});
	}else{
		res.redirect('/operator?url=/data');
	}
});

app.get('/users', function(req,res) {
	if (userCon.isLogin()){
		res.render('manuser', {user:AV.User.current()});
	}else{
		res.redirect('/operator?url=/data');
	}
});


app.post('/login', userCon.login);
app.get('/logout', function (req, res) {
	AV.User.logOut();
	res.redirect('/operator');
});

app.post('/alipay/asyncnotice',function  (req,res) {
	console.log("alibaba:");
	console.log(req.body);
	console.log("alibaba:");
	var flowNo = req.body.out_trade_no;
	console.log("out_trade_no",flowNo);
	var Order = AV.Object.extend("Order");
	var query = new AV.Query(Order);
	query.equalTo("flowNo", flowNo);
	query.first({
		success: function(object) {
			console.log("Object begin trade");
			object.set("status","paid");
			object.save();
			console.log("Object end trade");
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
