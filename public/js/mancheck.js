/**
 * underscore template settings
 */
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
      // avatar: 'img/user1.png'
    }});
 	var UserList = AV.Collection.extend({
 		model: User
 	});

 	var UserItemView = AV.View.extend({
 		tagName:  "div",
 		template: _.template($('#user-tpl').html()),
 		events: {

 		},
 		initialize: function() {
 			_.bindAll(this, 'render');
 		},
 		render:function(){
 			// console.log(this.model);
 			// console.log(this.model.toJSON());
 			this.$el.html(this.template(this.model.toJSON()));
 			return this;
 		},
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
    		// console.log(person);
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