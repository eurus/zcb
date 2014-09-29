require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:

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
