var User = AV.Object.extend('_User');
var zutil = require('cloud/zutil.js');

function login(req, res, next) {
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

function isLogin(){
  return AV.User.current();
}

function findUser(queryFn) {
  var q = new AV.Query(User);
  queryFn.call(this, q);
  return q.first();
}

function findRawClientByEmail(email) {
  return findUser(function (q) {
    q.equalTo('email', email);
  });
}

function findRawUserById(id) {
  return findUser(function (q) {
    q.equalTo('objectId', id);
  });
}

function findUserById(id) {
  console.log('id = '+id);
  return findRawUserById(id).then(function (c) {
    if (c) {
      c = transfromUser(c);
    }
    return AV.Promise.as(c);
  });
}

function findUserByEmail(email) {
  var p = new AV.Promise();
  findRawClientByEmail(email).then(function (user) {
    if (user) {
      var user = transfromUser(user);
      p.resolve(user);
    } else {
      p.resolve();
    }
  },zutil.rejectFn(p));
  return p;
}

function updateCurUser(map) {
  var user=AV.User.current();
  if (map.email) {
    user.set('email', map.email);
  }
  if (map.username) {
    user.set('username', map.username);
  }
  return user.save();
}

function transfromUser(curUser) {
  return {
    username:curUser.get('username'),
    id:curUser.id,
    qq:curUser.get('qq'),
    email:curUser.get('email'),
    token:curUser.get('sessionToken'),
    emailVerified:curUser.get('emailVerified')
  };
}

function findUserByName(name){
  return findUser(function(q){
    q.equalTo('username',name)
  });
}

exports.login = login;
exports.isLogin = isLogin;
exports.findUserById = findUserById;
exports.findUserByName = findUserByName;
exports.transfromUser = transfromUser;
exports.findRawUserById = findRawUserById;
