var express = require('express');

var userCon = require('cloud/user.js');
var zutil = require('cloud/zutil.js');

AV.Cloud.define('api/findUserById', function(req, res){
	var id = req.params.id || '';
	userCon.findUserById(id).then(function(user){
		res.success(user);
	}, function(){
		res.error('error');
	});
});

AV.Cloud.define('api/findUserByName', function(req, res){
	var name = req.params.username || '';
	userCon.findUserByName(name).then(function(user){
		res.success(user);
	}, function(){
		res.error('error');
	});
});

exports.auth = express.basicAuth(userCon.isLogin);