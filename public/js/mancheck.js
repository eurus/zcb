 _.templateSettings = {
 	evaluate    : /{([\s\S]+?)}/g,
 	interpolate : /{=([\s\S]+?)}/g,
 	escape      : /{-([\s\S]+?)}/g
 };
$.fn.bootstrapSwitch.defaults.size = 'mini';
$.fn.bootstrapSwitch.defaults.offText = '未检';
$.fn.bootstrapSwitch.defaults.onText = '已检';


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

    var Item = AV.Object.extend('Item',{
        defaults:{
            name:'',
            checked: "false"
        }
    })
 	var CheckView = AV.View.extend({
        el:"<div class='full-height full-width'></div>",
 		// tagName: "div",
 		template: _.template($('#checklist-tpl').html()),
 		events: {
            "click .add": "addOne",
            "click .upd": "updateItem"
 		},
 		initialize: function(options) {
 			_.bindAll(this, 'render','addOne','remove',"updateItem");
            this.items = options.model.get('items');
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON));
            _.each(this.items, this.addOne);
            // $('#user-list .item').first().trigger('click');
            $('#order-panel').html(this.el);
            $("[name='status']").bootstrapSwitch();

            $('#check-title').html(this.model.get('user').get("nickname")+" 的体检单"+'<i class="fa fa-plus add pull-right white"></i>');
            return this;
        },
        addOne:function(item){
            var itemview = new CheckItemView({data: item});
            this.$('#checkitem').append(itemview.render().el);
            $("[name='status']").bootstrapSwitch();
        },
        updateItem: function() {
            var itms = $('#checkitem .it');
            var result_itms = [];
            _.each(itms, function(itm) {
                var a_0 = $('input[name="name"]',itm).val();
                var a_1 = $('input[name="status"]',itm).is(":checked");
                result_itms.push([a_0,a_1]);
            });
            this.model.set("items",result_itms);
            this.model.save();
        }
    });

    var CheckItemView = AV.View.extend({
        el:'<div class="user-item it" style="text-align:center"></div>',
        // tagName: "div",
        attributes: {
            class: "it"
        },
        template: _.template($('#item-tpl').html()),
        events: {
            "click .btn-remove":'remove'
        },
        initialize: function(options) {
            _.bindAll(this, 'render','remove');
            this.model = options.data;
            this.item = new Item();
            this.item.set("name",this.model[0]);
            this.item.set("checked",this.model[1]);
            this.item.bind('destroy', this.remove);
        },
        render:function(){
            this.$el.html(this.template(this.item.toJSON()));
            return this;
        }
    });

    var UserItemView = AV.View.extend({
        el: "<div class = 'user-item'></div>",

       template: _.template($('#user-tpl').html()),
       events: {
        'click .item': 'showCheckList'
    },
    initialize: function() {
        _.bindAll(this, 'render');
    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.attr('id', 'user-'+this.model.get('peerId'));
        this.$el.data('peer-id', this.model.get('peerId'));
        return this;
    },
    showCheckList: function() {
        $('.user-item').removeClass('user-item-selected');
        this.$el.addClass("user-item user-item-selected");
        var user = new User();
        user.id = this.model.id;
        var query = new AV.Query(Check);
        query.equalTo('user', user);
        query.include('user');
        query.first({
            success: function(checkList) {
                if(typeof(checkList) !== 'undefined'){
                    var checkView = new CheckView({model: checkList});
                }else{
                    checkList = new Check();
                    checkList.set("user",user);
                    checkList.save();
                    var checkView = new CheckView({model: checkList});
                }
                checkView.render();
            },
            error: function(error) {
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
        $('#user-list').html(this.$el);
    }
});

 var userListView = new UserListView();
 userListView.render();
});
