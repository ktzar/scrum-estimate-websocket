//Chat Class
var Estimate = function(user_options) {

    /*
     ******* Attributes and variables *********
     */
    var that        = this; //scope helper
    var callbacks   = ['list', 'disconnect', 'nickchange', 'connect']; //Callback functions to be integrated in the options
    this.nick       = null;     //The current nick
    this.options    = { };      //default options


    /*
     ******* Functions *********
     */

    this.connect = function() {
        //create socket
        that.socket = io.connect('/');
        that.socket.on('connect', function(){
            that.options['_cb_connect']();
        });
        that.socket.on('disconnect', function(){
            console.log("Connection closed");
            that.options['_cb_disconnect']();
        });
    };

    // Initialise
    this.init = function() {
        //create empty callback functions so we don't have errors when they're called but haven't been specified in the options
        for (var i in callbacks) {
            that.options['_cb_'+callbacks[i]] = function(){};
        }

        //merge options
        for (var attrname in user_options) { 
            that.options[attrname] = user_options[attrname]; 
        }

        that.connect();

        //Set the stored nick if it's been stored
        if (that.hasLocalStorage) {
            var nick = localStorage.getItem("nick");
            console.log('retrieve nick: ', nick);
            if ( nick ) {
                that.setNick(nick);
            }else{
                nick = prompt("Can I have your name please?");
                if (nick == "") return;
                localStorage.setItem('nick', nick);
                that.setNick(nick);
            }
        }

        that.socket.on('list', function (msg) {
            console.log('list', msg);
            //call that.options.cb_list
        });

        //Internal callbacks process
        //Store the current nick
        that.socket.on('nick', function (new_nick) {
            that.nick = new_nick;
            that.options['_cb_nickchange'](new_nick);
        });
    }
    
    //message sending function
    that.sendPoints = function(points) {
        that.socket.emit('points', points); 
    };

    //change nick 
    that.setNick = function(nick) {
        that.socket.emit('nick', nick); 
        if ( that.hasLocalStorage ) {
            console.log('store nick: ', nick);
            localStorage.setItem("nick", nick);
        }
    };

    //check for HTML5 Storage
    this.hasLocalStorage = function supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }();

    this.init();
}

var estimate;
var name;

function nickChange (nick) {
    console.log('nickChange ',nick);
    $('.currentName').text(nick);
}

//Send the points
function sendPoints (points) {
    console.log('send '+points);
    estimate.sendPoints(points);
}


function init() {
    //instantiate conn class
    estimate = new Estimate({
        _cb_nickchange: nickChange,
        _cb_list: function(data){console.log('list', data);},
        _cb_disconnect: function(){
            $('#wrapper').html("<div class='jumbo'>Connection lost<br/><span class='hint'>maybe other user connected with your name? Try changing names</span></div>");
            $('.menu .connection').addClass('disconnected');
            $('.menu .connection label').text('Disconnected');
        },
        _cb_connect: function(){
            $('.menu .connection').removeClass('disconnected');
            $('.menu .connection label').text('Connected');
        },
    });
}
function changeName() {
    name = prompt("Can I have your name please?");
    estimate.setNick(name);
    return name;
}

$(function(){
    //ask for a name
    init();

    $('#values li').click(function(){
        $('#values li').removeClass('selected');
        sendPoints(parseFloat($(this).text()));
        $(this).addClass('selected');
    });

    $('li.change_name').on('click', function() {
        changeName();
    });

    $('.menu').on('click', '.connection.disconnected', function(){
        estimate.init();
    });

});
