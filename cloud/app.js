// 在 Cloud code 里初始化 Express 框架
var express = require('express');


var app = express();
var expressLayouts = require('express-ejs-layouts');


// App全局配置
if (__production)
  app.set('views', 'cloud/views');
else
  app.set('views', 'cloud/views');

app.set('view engine', 'ejs');    // 设置template引擎
app.use(express.bodyParser());    // 读取请求body的中间件
app.use(expressLayouts);


// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/dash', function(req, res) {
  res.render('dash');
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
