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
	toPeerId = peerId;
	$('#to-peer-id').text(toPeerId);
    // 重新设定选择对话人
    $('.user-item-selected').removeClass('user-item-selected');
    $('#user-'+peerId).addClass('user-item-selected');
    orderRouter.home();
}
var orderRouter = null;

$(function() {


 AV.$ = jQuery;
 AV.initialize( "eenezb2s4tnlbytmv8rt3ndrv4qiux13jg7s90n7ff72kvoa",
 	"flo4ra0v81t51v0ug33pzwvm4xsclmgqo23fqht4iendgoio");
 var User = AV.Object.extend('_User');

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
 		_.bindAll(this, 'change', 'reset');
 		this.order = options.order;

 		this.cars = new CarList;
 		if (customer!= null){
 			this.cars.query = new AV.Query(Car);//customer.relation('cars').query();
 			this.cars.query.equalTo('user', customer);

 		}else{
 			console.log(customer)
 		}

 		this.cars.bind('reset', this.reset);
 		this.cars.bind('change',this.reset);
 		if (customer)
	 		this.render();
 	},

 	render:function(){
 		this.$el.html(this.template());
 		this.cars.fetch();
 		return this;
 	},

 	reset:function(cars){
 		var carOptionTpl =  _.template($('#car-option-tpl').html());
 		var carOptions = _.reduce(cars.models, function(options, car){
 			return options + carOptionTpl(car.toJSON());
 		}, '');
 		$('#car-ids', this.$el).prepend(carOptions);
 		if (this.order.get('car')){
 			$('#car-ids').val(this.order.get('car').id);
 		}else{
 			$('#car-ids').val($('#car-ids option:first').val());
 		}
 		$('#car-ids').trigger('change');
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
 		"blur .btn-save":"save",
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
 		status:'processing',
 		cancelReason:'',
 		items:[],
			// package: '',
			flowNo: '',
			car: new Car,
			address: new Address,
			serviceTime: new Date()
		},initialize:function(){
			if (!this.get("user")) {
				this.set({"user": customer });
			}
		}
	});
 var OrderList = AV.Collection.extend({ model: Order });

 var OrderView = AV.View.extend({
 	// el:"#order",
 	initialize: function(options) {
 		_.bindAll(this, 'reset');

 		this.orders = new OrderList;
 		this.orders.query = new AV.Query(Order);
 		this.orders.query.include('car');
 		this.orders.query.include('address');
 		this.orders.query.include('items');
 		this.orders.bind('reset', this.reset);
 		//this.render();
	 	
 	},
 	render:function(){
 		this.orders.query.equalTo('user', customer);
 		this.orders.fetch();
 	},
 	reset:function(orders){
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

 		this.$el.empty();
 		this.$el.append(this.carView.el);
 		this.$el.append(this.addrView.el);
 		this.$el.append(this.itemView.el);
 		this.$el.append(this.otherView);
 		this.delegateEvents();
 	}
 });

 var OrderListView = AV.View.extend({
 	el:'',
 	initialize:function(){
 	},
 	render:function(){
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
 		if (this.currentView) {
 			this.currentView.remove();
 		}
 		var username = $('#to-peer-id').text()

 		var userQuery = new AV.Query(User);
 		userQuery.equalTo('username', username);
 		$('#order').empty();
 		userQuery.first().then(function(user){
 			customer = user;
 			view.render();
 			if (customer){
		 		$('#order').html(view.$el);
		 		$('.datetimepicker').datetimepicker();
 			}
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