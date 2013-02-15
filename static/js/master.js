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

    this.kickoutUser = function(id) {
        console.log('kicking out', id);
        that.socket.emit('kickout', {'id':""+id});
    };

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

/**
 * @param Array
 */
function calculateDeviation(estimations){
    var deviation = 0;
    var sum = 0;
    for (var i in estimations) {
        sum += parseFloat(estimations[i]);
    }
    var average = sum / estimations.length;
    for (var i in estimations) {
        deviation += Math.pow(estimations[i]-average,2);
    }
    deviation = parseInt(100*Math.sqrt(deviation/estimations.length))/100;
    return deviation;
};

var target = 0;
var current = 0;

var animation = function(){
    if (parseFloat(Math.abs(target-current))<0.1) {
        current = target;
        clearInterval(animationInterval);
    }else{
        var direction = parseInt((target-current) / Math.abs(target-current));
        current += direction*0.1;
    }
    $('.average').text(current.toFixed(2));
};
var animationInterval;

function updateList(contacts) {
    console.log(contacts);
    var contact;
    var total = 0;
    var sum = 0;
    var average = 0;
    var deviation = 0;
    var estimations = [];
    $('#list').html('');
    for (_c in contacts) {
        contact = contacts[_c];
        if (contact.points > 0) {
            estimations.push(contact.points);
            sum += contact.points;
            total ++;
            $('#list').html($('#list').html() + "<li data-id='"+_c+"'><i class='remove icon-remove-sign'></i>&nbsp;"+contact.name+": "+contact.points+"</li>");
        }
    }
    if (total > 0) {
        average = parseFloat(sum/total);
        target = average;
        //Calculate standard deviation
        deviation = calculateDeviation(estimations);
        $('#value').html("<div class='average'>"+current+"</div><div class='deviation'>σ="+deviation+"</div><div class='people'>"+total+" estimators</div>");
        document.title = average+"(σ="+deviation+") ♞="+total;
    }else{
        average = "No votes";
        $('#value').html(average);
        document.title = average;
    }
    animationInterval = setInterval(animation, 10);
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

    $('#list').on('click', '.remove', function() {
        var id = $(this).closest('li').attr('data-id');
        estimate.kickoutUser(id);
    });
    var epic = $('#epic')[0];
    $('.btn-epic').on('click', function() {
        epic.currentTime = 0;
        if (epic.paused) {
        }else{
            epic.pause();
        }
    });
    init();

});
