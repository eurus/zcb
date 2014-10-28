 _.templateSettings = {
 	evaluate    : /{([\s\S]+?)}/g,
 	interpolate : /{=([\s\S]+?)}/g,
 	escape      : /{-([\s\S]+?)}/g
 };
 $(function() {
 	AV.$ = jQuery;
 	AV.initialize( "za9bsa07s9lwzxl6t1sp9ft3fi5ypo0d47ylo1f5bnze0m34",
 		"0efztvcng6f5klnksu9syv4o55py3z9pypppjzxuzuwwqmtb");
 	var User = AV.Object.extend('_User', {
        defaults: {
        }});
 	var Check = AV.Object.extend('CheckList', {
        defaults:{
            items:[]
        }});
 	var UserList = AV.Collection.extend({
 		model: User
 	});
 	var CheckView = AV.View.extend({
 		tagName: "div",
 		template: _.template($('#checklist-tpl').html()),
 		events: {
            "click .add": "addOne"
 		},
 		initialize: function(options) {
 			_.bindAll(this, 'render','addOne');
            this.items = options.model.get('items');
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON));
            _.each(this.items, this.addOne);
            $('#checkitem').html(this.el);
            return this;
        },
        addOne:function(item){
            var itemview = new CheckItemView({data: item});
            this.$el.append(itemview.render().el);
        }
    });

    var CheckItemView = AV.View.extend({
        tagName: "div",
        template: _.template($('#item-tpl').html()),
        events: {

        },
        initialize: function(options) {
            _.bindAll(this, 'render');
            this.model = options.data;
        },
        render:function(){
            this.$el.html(this.template({
                name: this.model[0],
                checked: this.model[1]
            }));
            return this;
        }
    });

    var UserItemView = AV.View.extend({
       tagName:  "div",
       template: _.template($('#user-tpl').html()),
       events: {
        'click .item': 'showCheckList'
    },
    initialize: function() {
        _.bindAll(this, 'render');
    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    showCheckList: function() {
        var user = new User();
        user.id = this.model.id;
        var query = new AV.Query(Check);
        query.equalTo('user', user);
        query.first({
            success: function(checkList) {
                if(typeof(checkList) !== 'undefined'){
                    console.log("has cheklist");
                    // console.log(checkList.get("items"));
                    var checkView = new CheckView({model: checkList});   
                }else{
                    console.log("has not checklist");
                    checkList = new Check();
                    // console.log(checkList.get("items"));
                    var checkView = new CheckView({model: checkList});   
                }
                checkView.render();
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
        
    }
});
 var UserListView = AV.View.extend({
     el: '',
     events:{

     },
     initialize:function(){
        _.bindAll(this, 'addOne', 'render','addAll');
        this.people = new UserList;
        this.people.query = new AV.Query(User);
        this.people.bind('add', this.addOne);
        this.people.bind('reset',this.addAll);
    },
    render:function(){
        this.$el.html("");
        this.people.fetch();
        this.delegateEvents();    	

    },
    addOne: function(person) {
        var view = new UserItemView({model: person});
        this.$el.append(view.render().el);
    },
    addAll: function(people) {
        people.each(this.addOne);
        $('#user-list').html(this.el);
    }
});

 var userListView = new UserListView();
 userListView.render();


});