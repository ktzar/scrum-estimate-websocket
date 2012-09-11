//Chat Class
var Estimate = function(user_options) {

    var that = this;
    //The current nick
    this.nick = null;
    //default options
    this.options = { };
    var callbacks = ['list'];
    for (var i in callbacks) {
        this.options['_cb_'+callbacks[i]] = function(){};
    }
    //merge options
    for (var attrname in user_options) { 
        this.options[attrname] = user_options[attrname]; 
    }

    this.socket = io.connect('/');
    this.socket.on('connect', function(){});
    this.socket.on('disconnect', function(){
        alert("Connection closed");
    });

    this.socket.on('list', function (msg) {
        console.log('list', msg);
        updateList(msg);
    });
}


var estimate;

function updateList(contacts) {
    console.log(contacts);
    var contact;
    var total = 0;
    var sum = 0;
    var average = 0;
    $('#list').html('');
    for (_c in contacts) {
        contact = contacts[_c];
        if (contact.points > 0) {
            sum += contact.points;
            total ++;
            $('#list').html($('#list').html() + "<li>"+contact.name+": "+contact.points+"</li>");
        }
    }

    if (total > 0) {
        average = parseInt(100*sum/total)/100;
    }else{
        average = "No votes";
    }
    $('#value').html(average);
    document.title = average;
}

function init() {
    //instantiate conn class
    estimate = new Estimate();
}
//onLoad
$(function(){
    //ask for a name
    var name = null, i = 0;
    $('#toggle_list').click(function(){
        $('#list').slideToggle();
    });
    $('#list').hide();
    init();

});
