require("cloud/app.js");
var userCon = require('cloud/user.js');
var zutil = require('cloud/zutil.js');

function forceLogin(res){
  if (!userCon.isLogin()){
    res.error('please login');
  }
}

function getCSnames () {
  var role = AV.Object.extend("_Role");
  var query = new AV.Query(role);
  query.equalTo('name', 'operator');
  return query.first().then(function (obj) {
    return obj.relation('users').query().find();
  }).then(function(list){
    var namelist =[];
    for (var i = list.length - 1; i >= 0; i--) {
      namelist.push(list[i].get("username"));
    }; 
    var p = new AV.Promise();
    console.log(namelist);
    p.resolve(namelist);
    return p;
  });
}

AV.Cloud.define('findUserById', function(req, res){
  forceLogin(res);
  var id = req.params.uid || '';
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

AV.Cloud.define("getOrderList", function(req, res) {
  var Order = AV.Object.extend("Order");
  var User = AV.Object.extend("_User");
  var user = new User();
  user.id = req.params.uid

  var query = new AV.Query(Order);
  query.include("user");
  query.include("package");
  query.include("car");
  query.include("store");
  query.include("salesman");
  query.include("address");
  query.include("operator");

  query.equalTo("user",user);
  query.find({
    success: function(results) {
      console.log("Successfully retrieved " + results.length + " scores.");
      res.success(results);
    },
    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
});

AV.Cloud.define("getOnlineCustomerService", function(req, res) {
  temp = req.params.temp;
  getCSnames().then(function(namelist){
   name = namelist[Math.floor(Math.random()*namelist.length)]
   console.log(name);
   if(temp == "n") {
  //return customer servece peerid only 
  result = {
    cspid: name
  }
  res.success(result);
} else {
  //return customer servece peerid and customer peerid
  n = (new Date()).getTime();
  str1 = n + "";
  str2 = Math.random().toString(36).substring(7);

  result = {
    operatorPeerId: name,
    tempPeerId: str1 + str2
  }
  res.success(result);
}
});
});



