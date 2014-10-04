exports.login = function(req, res, next) {
  var user = req.body.user;
  console.log('login');
  AV.User.logIn(user.username, user.password).then(function() {
        //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
        //跳转到profile页面。
        console.log('signed in successfully: %j', AV.User.current());
        res.redirect('/dash');
      },function(error) {
        //登录失败，跳转到登录页面
        res.redirect('/');
      });
}