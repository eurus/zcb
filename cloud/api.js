var express = require('express');

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

exports.auth = express.basicAuth(userCon.isLogin);