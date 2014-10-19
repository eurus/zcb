require("cloud/app.js");
var unirest = require('unirest');
var crypto = require('crypto');
var moment = require('moment');
var avchat = require('lean-cloud-chat');
var userCon = require('cloud/user.js');
var zutil = require('cloud/zutil.js');
var _=require('underscore');

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
      // result = {peerId: list[i].get("peerId"),nickname:list[i].get("nickname")}
      namelist.push(list[i].get("peerId"));
    }; 
    var p = new AV.Promise();
    p.resolve(namelist);
    return p;
  });
}


AV.Cloud.define('findUserById', function(req, res){
  var id = req.params.uid || '';
  userCon.findUserById(id).then(function(user){
    res.success(user);
  }, function(){
    res.error('error');
  });
});

AV.Cloud.define('findUserByName', function(req, res){
  // forceLogin(res);
  var name = req.params.username || '';
  userCon.findUserByName(name).then(function(user){
    res.success(user);
  }, function(){
    res.error('error');
  });
});

AV.Cloud.define('findUserByPeerId', function(req, res){
  // forceLogin(res);
  var peerId = req.params.peerId || '';
  userCon.findUserByPeerId(peerId).then(function(user){
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
  query.descending("createdAt");
  query.equalTo("user",user);
  query.find({
    success: function(results) {
      console.log(user+"successfully retrieved " + results.length + " orders.");
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
   appId="za9bsa07s9lwzxl6t1sp9ft3fi5ypo0d47ylo1f5bnze0m34";
   chat = new avchat({
    appId: appId,
    peerId:'backend-chat-server'
  });

   chat.open().then(function(data){
    // peerId_namelist = _.pluck(namelist,'peerId');
    chat.getStatus(namelist.toString().split(',')).then(function(data) {
      console.log( data);
      name =data.onlineSessionPeerIds[Math.floor(Math.random()*data.onlineSessionPeerIds.length)]
      console.log(name);
      if(temp == "n") {
        result = {
          cspid: name
        }
        res.success(result);
      } else {
        n = (new Date()).getTime();
        str1 = n + "";
        str2 = Math.random().toString(36).substring(7);

        result = {
          cspid: name,
          tempPeerId: str1 + str2
        }
        res.success(result);
      }
    });
  },function(data){
    console.log('open rejected',data);
  });    
 });
});
function predicatBy(prop){
 return function(a,b){
  if( a[prop] > b[prop]){
    return 1;
  }else if( a[prop] < b[prop] ){
    return -1;
  }
  return 0;
}
}
AV.Cloud.define("getPackType", function(req,res) {
  var Package = AV.Object.extend("Package");
  var query = new AV.Query(Package);
  query.find({
    success:function(results) {
     all_type = _.map(results,function (v) {
      result = {type: v.get("type"),order: v.get("order")}
      return result;
    })
     sort_list = all_type.sort( predicatBy("order") );  
     console.log(sort_list);
     sort_all_type = _.pluck(sort_list, 'type');
     suc_type = _.uniq(sort_all_type);
     res.success(suc_type);
   }
 });

});

AV.Cloud.define("getchathis", function(req,res) {
  console.log(req.params);
  fpid = req.params.frompid;
  tpid = req.params.topid;
  id_string = fpid+':'+tpid;
  convid = crypto.createHash('md5').update(id_string).digest('hex');
  console.log(convid);
  limit = 50;
  uri = 'https://cn.avoscloud.com/1.1/rtm/messages/logs'
  +'?convid='+convid;

  unirest.get(uri)
  .headers({ 
    "X-AVOSCloud-Application-Id":" za9bsa07s9lwzxl6t1sp9ft3fi5ypo0d47ylo1f5bnze0m34",
    "X-AVOSCloud-Application-Key": "0efztvcng6f5klnksu9syv4o55py3z9pypppjzxuzuwwqmtb"
  })
  .send(new Buffer([1,2,3]))
  .end(function (response) {
    console.log(response.body);
    res.success(response.body);
  });
});

AV.Cloud.define("getHealthCheckList", function(req,res) {
 var CheckList = AV.Object.extend("CheckList");
 var User =  AV.Object.extend("_User");
 var user = new User();
 user.id = req.params.userid;
 var query = new AV.Query(CheckList);
 query.include("user");
 query.equalTo("user", user);
 console.log(req.params.userid);
 query.find({
  success: function(results) {
    res.success(results);
  }
});
});

function padLeft(str, length) {
  if (str.length >= length)
    return str;
  else
    return padLeft("0" + str, length);
}

AV.Cloud.beforeSave("Order", function(req,res){
  var pkg = req.object.get('package');
  var items = req.object.get('items');
  console.log('--- pkg ---');
  console.log(pkg);
  console.log('--- items ---')
  console.log(items)

  query = new AV.Query("Order");
  query.include("package");
  query.count({
    success: function(count) {
      var this_count = count + 1;
      var this_flowNo = padLeft(this_count,6);
      var save_flowNo = moment().format("YYYYMMDD") + this_flowNo;
      console.log('flow no:'+save_flowNo);
      req.object.set("flowNo",save_flowNo);

      if (typeof pkg != 'undefined'){
        var q = new AV.Query('Package');
        q.get(pkg.id, {
          success:function(pack){
            var total_price = 0;

            console.log(pack.get('price'));
            total_price += pack.get('price');

            console.log('after pkg: '+total_price);

            if (typeof items != 'undefined'){
              console.log(items);
              var sum = _.reduce(items, function(sum, i){
                return sum + parseFloat(i.price)*100/100.0;
              }, 0);
              console.log('sum = '+sum);
              total_price += sum;
            }
            console.log('after items:' + total_price);

            total_price = parseInt(total_price*100)/100.0;
            req.object.set('total_price', total_price.toString());

            console.log('total price: '+total_price);
            res.success();
          }
        })
      }
      
    },
    error: function(error) {
      throw "Got an error " + error.code + " : " + error.message;
    }
  });
});

function updateTotalPrice(request){
 console.log("Updated order,the id is :" + request.object.id);
 query = new AV.Query("Order");
 query.include('package');
 query.include('items');
 query.get(request.object.id, {
  success:function(order){
    var pkg = order.get('package');
    var items = order.get('items');
    var total_price = 0;
    if (typeof pkg != 'undefined'){
      total_price += pkg.get('price');
    }
    console.log('total price: '+total_price);

    if (typeof items != 'undefined'){
      console.log(items);
      var sum = _.reduce(items, function(sum, i){
        return sum + i.price;
      }, 0);
      console.log('sum = '+sum);
      total_price += sum;
    }
    total_price = parseInt(total_price*100)/100.0;
    order.set('total_price', total_price.toString());
    console.log('total price: '+total_price);
    order.save();
  },
  error:function(e){
    throw 'got an error' + error.code + ':'+error.message;
  }
});
}
AV.Cloud.afterUpdate("Order", updateTotalPrice);