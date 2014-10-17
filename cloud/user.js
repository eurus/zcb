var User = AV.Object.extend('_User');
var zutil = require('cloud/zutil.js');

function login(req, res, next) {
  var user = req.body.user;
  AV.User.logIn(user.username, user.password).then(function() {
        console.log('signed in successfully: %j', AV.User.current());
        res.redirect('/chat');
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
      c = transformUser(c);
    }
    return AV.Promise.as(c);
  });
}

function findUserByEmail(email) {
  var p = new AV.Promise();
  findRawClientByEmail(email).then(function (user) {
    if (user) {
      var user = transformUser(user);
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

function transformUser(curUser) {
  var result = {
    username:curUser.get('username'),
    id:curUser.id,
    mobile:curUser.get('mobile'),
    email:curUser.get('email'),
    nickname: curUser.get('nickname'),
    peerId: curUser.get('peerId')
  };

  if (curUser.get('avatar')){
    result.avatarUrl = curUser.get('avatar').thumbnailURL(64, 64);
  }else{
    result.avatarUrl = 'img/user1.png ';
  }

  return result;
}

function findUserByName(name){
  return findUser(function(q){
    q.equalTo('username',name)
  }).then(function (c) {
    if (c) {
      c = transformUser(c);
    }
    return AV.Promise.as(c);
  });
}

function findUserByPeerId(peerId){
  return findUser(function(q){
    q.equalTo('peerId',peerId)
  }).then(function (c) {
    if (c) {
      c = transformUser(c);
      return AV.Promise.as(c);
    }else{
      return AV.Promise.as({
        peerId:peerId
      });
    }
  });
}

exports.login = login;
exports.isLogin = isLogin;
exports.findUserById = findUserById;
exports.findUserByName = findUserByName;
exports.findUserByPeerId = findUserByPeerId;
exports.transformUser = transformUser;
exports.findRawUserById = findRawUserById;
