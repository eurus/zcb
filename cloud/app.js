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
	res.render('operator');
});

app.get('/', function(req, res) {
	res.render('index');
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
