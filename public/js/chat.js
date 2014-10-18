/**
 * underscore template settings
 */
 _.templateSettings = {
 	evaluate    : /{([\s\S]+?)}/g,
 	interpolate : /{=([\s\S]+?)}/g,
 	escape      : /{-([\s\S]+?)}/g
 };

 $.fn.serializeObject = function()    
 {    
 	var o = {};    
 	var a = this.serializeArray();    
 	console.log(a);
 	$.each(a, function() {    
 		if (o[this.name]) {    
 			if (!o[this.name].push) {    
 				o[this.name] = [o[this.name]];    
 			}    
 			o[this.name].push(this.value || '');    
 		} else {    
 			o[this.name] = this.value || '';    
 		}    
 	});    
 	return o;    
 };

 function getMS(){
 	return (new Date()).getTime();
 }


/*----------------------------------------------------------
*						CHAT
* --------------------------------------------------------*/

function setSendTo(peerId) {

  }
  var orderRouter = null;

  $(function() {


  	AV.$ = jQuery;
  	AV.initialize( "za9bsa07s9lwzxl6t1sp9ft3fi5ypo0d47ylo1f5bnze0m34",
  		"0efztvcng6f5klnksu9syv4o55py3z9pypppjzxuzuwwqmtb");

/*-------------------------------------------------------------
							USER
-------------------------------------------------------------*/
  	var User = AV.Object.extend('_User', {
  		defaults:{
  			nickname:'',
  			username:'',
  			password:'',
  			peerId: '',
  			mobile:'',
  			mobileVerified: false
  		}
  	});

  	var UserView = AV.View.extend({
			template:_.template($('#user-form-tpl').html()),
			events:{
				"click .btn-save":"save"
			},

			initialize:function(options){
				console.log('init user view');
			},

			render:function(){
				this.$el.html(this.template());
			},

			save:function(val){
				var self = this;
				var mobile = $('#user-form input[name=mobile]').val();
				var user = new User;
				var userForm = {
					'mobile': mobile, 
					'nickname':mobile,
					'username':mobile,
					'password':mobile,
					'peerId':toPeerId
				};
				console.log(userForm);
				user.save(userForm, {
					success:function(user){
						console.log(user);
						customer = user;
						orderRouter.home();
					}
				});

			},
			saveOrder:function(car){
				this.order.set('user', user);
				this.order.save();
			}

		});

/*-------------------------------------------------------------
							CAR
-------------------------------------------------------------*/
		var Car = AV.Object.extend("Car", {
			defaults:{
				make:'',
				series:'',
				year:0,
				plate:'',
				model:'',
				volume:''
			}
		});

		var CarList = AV.Collection.extend({
			model:Car,
			initialize:function(){
			}
		});

		var CarView = AV.View.extend({
			template:_.template($('#car-tpl').html()),
			events:{
				"change #car-ids":"change", 
				"click .btn-save":"save",
				"click .btn-cancel":"render"
			},

			initialize:function(options){
				console.log('init car view');
				_.bindAll(this, 'change', 'reset');
				this.order = options.order;

				this.cars = new CarList;
				
			},

			render:function(){
				console.log('render car view for '+customer.get('username'));
				this.cars.query = new AV.Query(Car);
				this.cars.query.equalTo('user', customer);

				this.cars.bind('reset', this.reset);
				this.cars.bind('change',this.reset);
				this.$el.html(this.template());
				var self = this;
				this.cars.fetch({
					error:function(cars, response, options){
						self.reset([]);
					}
				});
				return this;
			},

			reset:function(cars){
				if (!cars || cars.length <= 0){
					$('#car-ids').trigger('change');
				}else{

					var carOptionTpl =  _.template($('#car-option-tpl').html());
					var carOptions = _.reduce(cars.models, function(options, car){
						return options + carOptionTpl(car.toJSON());
					}, '');
					$('#car-ids', this.$el).empty();
					$('#car-ids', this.$el).append('<option value="">新增车辆…</option>')
					$('#car-ids', this.$el).prepend(carOptions);
					console.log('car ---');
					console.log(this.order.get('car'));
					if (this.order.get('car')){
						$('#car-ids').val(this.order.get('car').id);
					}else{
						$('#car-ids').val($('#car-ids option:first').val());
					}
					$('#car-ids').trigger('change');
				}
			},

			change:function(e){
				var carId = $(e.target).val();
				var carInfoTpl =  _.template($('#car-info-tpl').html());
				var carFormTpl =  _.template($('#car-form-tpl').html());
				var car = this.cars.filter(function(c){
					if (c.id == carId) {
						return c;
					} 
					return null;
				})[0];

				if (car){
					$('#car-info').html(carInfoTpl(car.toJSON()));
 			this.saveOrder(car);
 		}else{
 			$('#car-info').html(carFormTpl());
 		}
 	},

 	save:function(val){
 		var self = this;
 		var car = $('#car-form').serializeObject();
 		car.year = parseInt(car.year)|| 0;
 		if (customer.get('username') && customer.get('username').length > 0)
	 		car.user = customer;
 		//this.cars.create(car);
 		var carObj = new Car();
 		carObj.save(car, {
 			success:function(car){
 				self.saveOrder(car);
 				self.render();
 			}
 		});

 	},
 	saveOrder:function(car){
 		this.order.set('car', car);
 		this.order.save();
 	}

 });

/*-------------------------------------------------------------
ITEM
-------------------------------------------------------------*/
var ItemView = AV.View.extend({
	template:_.template($('#item-tpl').html()),
	events:{
		"click .btn-add":"add",
		"click .btn-remove":"remove",
		"click .btn-save":"save",
		"blur input,select":"save"
	},
	initialize: function(options){
		this.order = options.order;
	},
	render:function(){
		this.$el.html(this.template());
		var items = this.order.get('items');
		for (var i in items){
			var item = items[i];
			if (item){
				item.id = getMS();
				var infoTpl = _.template($('#item-info-tpl').html());
				$('#item-info', this.$el).prepend(infoTpl(item)); 	
			}
		}
	},
	add:function(){
		var infoTpl = _.template($('#item-info-tpl').html());
		var elem = infoTpl({name:'', price:0, id: getMS()});
 		$(elem).addClass('yfade').prependTo($('#item-info'));//.hide().prependTo($('#item-info')).effect("highlight", {}, 1500);
 	},
 	remove:function(e){
 		var id = $(e.target).data('item-id');
 		var elem = $('#'+id);
 		var item = {
 			name: $('input[name=name]', elem).val(),
 			price: $('input[name=price]', elem).val() || 0
 		}
 		elem.remove();
 		this.order.unset('items');
 		this.save();
 	},
 	save:function(e){
 		var itemsRaw = $('#item-form').serializeObject();
 		var items = []

 		if (Array.isArray(itemsRaw.name)){
 			for (var i in itemsRaw.name){
 				var name = itemsRaw.name[i];
 				var price = itemsRaw.price[i];
 				if (name != '' && price != ''){
 					items.push({
 						name:name,
 						price: parseFloat(price) || 0
 					})
 				}
 			}
 		}else{
 			items = [itemsRaw];
 		}
 		this.order.set('items', items);
 		this.order.save();

 		console.log(items);

 	}
 })


/*-------------------------------------------------------------
ADDRESS
-------------------------------------------------------------*/
var Address = AV.Object.extend("Address", {
	defaults:{
		contact:'',
		detail:'',
		mobile:'',
	}
});

var AddressList = AV.Collection.extend({ model:Address });

var AddressView = AV.View.extend({
	template:_.template($('#addr-tpl').html()),
	events:{
		"change #addr-ids":"change", 
		"click .btn-save":"save",
		"click .btn-cancel":"render"
	},

	initialize:function(options){
		_.bindAll(this, 'change', 'reset');

		this.addrs = new AddressList;
		this.order = options.order;

		if (customer!= null){
		this.addrs.query = new AV.Query(Address);//customer.relation('addrs').query();
		this.addrs.query.equalTo('user', customer);
 		}else{
 			console.log(customer)
 		}

 		this.addrs.bind('reset', this.reset);
 		this.addrs.bind('change',this.reset);
 		if (customer)
 			this.render();
 	},

 	render:function(){
 		this.$el.html(this.template());
 		this.addrs.fetch();
 		return this;
 	},

 	reset:function(addrs){
 		var addrOptionTpl =  _.template($('#addr-option-tpl').html());
 		var addrOptions = _.reduce(addrs.models, function(options, addr){
 			return options + addrOptionTpl(addr.toJSON());
 		}, '');

 		$('#addr-ids', this.$el).empty();
 		$('#addr-ids', this.$el).append('<option value="">新增地址…</option>');
 		$('#addr-ids', this.$el).prepend(addrOptions);
 		if (this.order.get('address')){
 			$('#addr-ids').val(this.order.get('address').id);
 		}else{
 			$('#addr-ids').val($('#addr-ids option:last').val());
 		}
 		$('#addr-ids').trigger('change');
 	},

 	change:function(e){
 		var addrId = $(e.target).val();
 		var addrInfoTpl =  _.template($('#addr-info-tpl').html());
 		var addrFormTpl =  _.template($('#addr-form-tpl').html());
 		var addr = this.addrs.filter(function(c){
 			if (c.id == addrId) {
 				return c;
 			} 
 			return null;
 		})[0];

 		if (addr){
 			$('#addr-info').html(addrInfoTpl(addr.toJSON()));
 			this.saveOrder(addr);
 		}else{
 			$('#addr-info').html(addrFormTpl());
 		}
 	},

 	save:function(val){
 		var self = this;
 		var addr = $('#addr-form').serializeObject();
 		addr.year = parseInt(addr.year)|| 0;
 		addr.user = customer;
 		//this.addrs.create(addr);
 		var addrObj = new Address();
 		addrObj.save(addr, {
 			success:function(addr){
 				self.saveOrder(addr);
 				self.render();
 			}
 		});
 	},
 	saveOrder:function(addr){
 		this.order.set('address', addr);
 		this.order.save();
 	}
 });
/*-------------------------------------------------------------
STORE
-------------------------------------------------------------*/
var Store = AV.Object.extend("Store");

/*-------------------------------------------------------------
ORDER
-------------------------------------------------------------*/

 var Order = AV.Object.extend("Order",{
 	defaults:{
 		status:'incomplete',
 		cancelReason:'',
 		items:[],
			// package: '',
			flowNo: '',
			car: new Car,
			address: new Address,
			serviceTime: new Date()
			// user:new User
		},initialize:function(){
			if (!this.get("user")) {
				this.set({"user": customer });
			}
		}
	});
var OrderList = AV.Collection.extend({ model: Order });

var OrderView = AV.View.extend({
 	// el:"#order",
 	events:{
 		"blur #other-info input,select":"save",
 		"click #other-info .btn-save":"commit"
 	},
 	initialize: function(options) {
 		console.log('init order view');
 		_.bindAll(this, 'reset', "save");

 		this.orders = new OrderList;
 		this.orders.query = new AV.Query(Order);
 		this.orders.query.include('car');
 		this.orders.query.include('address');
 		this.orders.query.include('items');
 		this.orders.bind('reset', this.reset);
 		//this.render();

 	},
 	render:function(){
 		console.log('render order view');
 		if (customer && customer.get('username') && customer.get('username').length > 0){
 			this.orders.query.equalTo('user', customer);
 			this.orders.fetch();
 		}else{
 			this.userView = new UserView();
 			this.userView.render();
 			this.$el.empty();
	 		this.$el.append(this.userView.el);
 		}
 	},
 	reset:function(orders){
 		console.log('reset order view');
 		console.log('orders length = '+orders.length);
 		if (orders.length > 0) {
 			this.order = orders.last();
 		}else{
 			this.order = new Order;
 		}

 		this.car = this.order.get('car');
 		this.carView = new CarView({
 			model: this.car,
 			order: this.order
 		});	

 		this.addr = this.order.get('address');
 		this.addrView = new AddressView({
 			model: this.addr,
 			order:this.order
 		});

 		this.itemView = new ItemView({
 			order: this.order
 		});	

 		this.carView.render();
 		this.addrView.render();
 		this.itemView.render();
 		this.otherView = _.template($('#other-tpl').html())();
 		// this.otherView.bind("blur input", this.save);

 		this.$el.empty();
 		this.$el.append(this.carView.el);
 		this.$el.append(this.addrView.el);
 		this.$el.append(this.itemView.el);
 		this.$el.append(this.otherView);
 		// $('.selectpicker', this.$el).selectpicker();
 		$('.datetimepicker', this.$el).datetimepicker();
 		this.delegateEvents();
 	},
 	save:function(){
 		var serviceTime = $('#other-info input[name=serviceTime]').val();
 		var time = moment(serviceTime, "YYYY-MM-DD hh:mm").toDate();
 		this.order.set('serviceTime', time);
 		this.order.save();
 	},
 	commit:function(){
 		this.order.set('status', 'unconfirmed');
 		this.order.save();
 		orderRouter.list();
 	}
 });
var OrderItemView = AV.View.extend({
	tagName:  "li",
	template: _.template($('#order-item-tpl').html()),
	events: {
		 "click .order-destroy"   : "clear"
	},
	initialize: function() {
		_.bindAll(this, 'render',  'remove');
		this.model.bind('change', this.render);
		this.model.bind('destroy', this.remove);
	},
	render:function(){
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
	clear: function() {
		this.model.destroy();
	}

})

var OrderListView = AV.View.extend({
	el:'',
	initialize:function(){
		var self = this;
		_.bindAll(this, 'addOne', 'addAll',  'render');
		this.$el.html(_.template($("#order-list-tpl").html()));
		this.orders = new OrderList;
		this.orders.query = new AV.Query(Order);
		this.orders.query.include('car');
		this.orders.query.include('address');
		this.orders.query.include('items');
		this.orders.bind('add',     this.addOne);
		this.orders.bind('reset',   this.addAll);
		
	},

	render:function(){
		this.orders.query.equalTo('user', customer);
 		this.orders.fetch();
		this.delegateEvents();
	},
	addOne: function(order) {
		var view = new OrderItemView({model: order});
		this.$("#order-list").append(view.render().el);
	},

	addAll: function(collection) {
		this.$("#order-list").html("");
		this.orders.each(this.addOne);
	}
})


var OrderRouter = AV.Router.extend({
	routes:{
		"order-home":"home",
		"order-list":"list"
	},
	currentView:null,
	initialize:function(el){
		this.el = el;
		this.homeView = new OrderView();
		this.listView = new OrderListView();
	},
	switchView: function(view) {
		console.log('switchView');
		if (this.currentView) {
			this.currentView.remove();
		}
		var peerId = toPeerId;

		var userQuery = new AV.Query(User);
		userQuery.equalTo('peerId', peerId);
		console.log('customer peerId = '+peerId);
		$('#order').empty();
		userQuery.first().then(function(user){
			customer = user;
			console.log('SWITCH TO VIEW RENDER');
			view.render();
			if (!customer){
				customer = new User;
			}
			$('#order').html(view.$el);

			self.currentView = view;
		});
	},
	remove:function(){
		$(this.el).empty().detach();
	},
	home:function(){
		this.switchView(this.homeView);
	},
	list:function(){
		this.switchView(this.listView);
	}
});
orderRouter = new OrderRouter();
AV.history.start();
});