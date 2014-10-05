require("cloud/app.js");
var userCon = require('cloud/user.js');
var zutil = require('cloud/zutil.js');

function forceLogin(res){
  if (!userCon.isLogin()){
    res.error('please login');
  }
}

AV.Cloud.define('findUserById', function(req, res){
  forceLogin(res);

  var id = req.params.id || '';
  userCon.findUserById(id).then(function(user){
    res.success(user);
  }, function(){
    res.error('error');
  });
});

AV.Cloud.define('findUserByName', function(req, res){
  forceLogin(res);

  var name = req.params.username || '';
  userCon.findUserByName(name).then(function(user){
    res.success(user);
  }, function(){
    res.error('error');
  });
});

AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
  var TestObject = AV.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({foo: "bar"}, {
    success: function(object) {
      console.log("AVOS Cloud works!");
    }
  });
  AV.Cloud.requestSmsCode('18651206017').then(function(){
    console.log("sms works!");
  }, function(err){
    console.log("sms not works!");
  });
});