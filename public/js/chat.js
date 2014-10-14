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

 var User = AV.Object.extend('_User');

 var CarList = AV.Collection.extend({
 	model:Car,
 	initialize:function(){
 	}
 });

 var Order = AV.Object.extend("Order",{
 	defaults:{
 		status:'processing',
 		cancelReason:'',
 		items:[],
			// package: '',
			store: '',
			flowNo: '',
			car: '',
			user: '',
			salesman: '',
			address: '',
			operator: '',
			serviceTime: ''
		}
	});

var Address = AV.Object.extend("Address", {
	defaults:{
		contact:'',
		detail:'',
		mobile:'',
	}
})

 var CarView = AV.View.extend({
 	template:_.template($('#car-tpl').html()),
 	events:{
 		"change #car-ids":"change", 
 		"click #save-car":"save",
 		"click #cancel-car":"render"
 	},

 	initialize:function(){
 		_.bindAll(this, 'change', 'reset');

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
 		$('#car-ids').val($('#car-ids option:first').val());
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
		 		self.render();
 			}
 		});

 	}

	});

 var OrderView = AV.View.extend({
 	// el:"#order",
 	initialize: function() {
 		//this.render();
 	},
 	render:function(){
 		var car = new Car;
 		var carView = new CarView({
 			model: car
 		});
 		this.$el.empty();
 		this.$el.append(carView.el);
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
 			if (customer)
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


/*-------------------------------------------------------------
						ADDRESS
-------------------------------------------------------------*/


