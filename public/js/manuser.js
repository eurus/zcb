 _.templateSettings = {
 	evaluate    : /{([\s\S]+?)}/g,
 	interpolate : /{=([\s\S]+?)}/g,
 	escape      : /{-([\s\S]+?)}/g
 };
 
 $(function() {
 	AV.$ = jQuery;
 	AV.initialize( "za9bsa07s9lwzxl6t1sp9ft3fi5ypo0d47ylo1f5bnze0m34",
 		"0efztvcng6f5klnksu9syv4o55py3z9pypppjzxuzuwwqmtb");
 	var User = AV.Object.extend("_User", {
        defaults:{
            username:'',
            password:'',
            nickname:'',
            peerId:''
        }
    });

    var UserCollection = AV.Collection.extend({model: User});

    var UserManView = AV.View.extend({
        el: "<div class='full-height'></div>",
        events: {
            "click .add":"newUser"
        },
        initialize: function() {
            _.bindAll(this, 'render','addOne','addAll','newUser');
            var tpl = _.template($("#user-man-tpl").html());
            this.$el.html(tpl());
            this.people = new UserCollection;
            this.people.query = new AV.Query(User);
            this.people.query.notEqualTo("softdestroy","true");
            this.people.bind('add', this.addOne);
            this.people.bind('reset',this.addAll);
        },
        render: function() {
            this.people.fetch();
            $("#content").html(this.el);
            this.delegateEvents();  
               
        },
        newUser:function(){
            var view = new UserSignUpView();
            $('#user-list').html(view.render().el);

        },
        addOne: function(person) {
            console.log('add one');
            var view = new UserItemView({model: person});
            $('#user-list').prepend(view.render().el);
        },
        addAll: function(people) {
            console.log("add all");
            this.$("#user-list").html("");
            people.each(this.addOne);
        }

    });



     var UserItemView = AV.View.extend({
        tagName: 'li',
        attributes: {
            class: ""
        },
        template: _.template(($('#user-item-tpl').html())),
        events: {
            "click .rm": "softDestroy",
            "click .upd": "updateUser"
        },
        initialize: function() {
            _.bindAll(this,'render','remove');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.remove);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));  
            return this;
        },
        updateUser: function(){
            var username = $('input[name="uname"]',this.$el).val();
            var nickname = $('input[name="nname"]',this.$el).val();
            user = {
                username: username,
                nickname: nickname,
                softdestroy: "false"
            };
            AV.Cloud.run('updateUser', user, {
              success: function(result) {
                UserView.render();
              },
              error: function(error) {
                console.log('oops, there is something wrong.');
              }
            });
        },
        softDestroy: function() {
            var username = $('input[name="uname"]',this.$el).val();
            var nickname = $('input[name="nname"]',this.$el).val();
            user = {
                username: username,
                nickname: nickname,
                softdestroy: "true"
            };
            AV.Cloud.run('updateUser', user, {
              success: function(result) {
                UserView.render();
              },
              error: function(error) {
                console.log('oops, there is something wrong.');
              }
            });
        }

    });
    var UserSignUpView = AV.View.extend({
        tagName: 'div',
        attributes: {
            class: ""
        },
        template: _.template(($('#user-signup-tpl').html())),
        events: {
            "click .cancel":"cancel",
            "click .signup": "signup"
        },
        initialize: function() {
            _.bindAll(this,'render','cancel',"signup");
        },
        render: function() {
            this.$el.html(this.template());  
            return this;
        },
        signup: function(){

        },

        cancel:function() {
            UserView.render();
        }
    });
 var UserView = new UserManView();
 UserView.render();

});