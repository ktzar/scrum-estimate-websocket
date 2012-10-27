function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}


function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
    }
}

//Chat Class
var Estimate = function(user_options) {

    var that = this;


    //The current nick
    this.nick = null;

    //check for HTML5 Storage
    this.hasLocalStorage = function supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }();

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
        console.log("Connection closed");
    });

    //message sending function
    this.sendPoints = function(points) {
        that.socket.emit('points', points); 
    };

    //change nick 
    this.setNick = function(nick) {
        this.socket.emit('nick', nick); 
        if ( this.hasLocalStorage ) {
            console.log('store nick: ', nick);
            localStorage.setItem("nick", nick);
        }
    };

    //Set the stored nick if it's been stored
    if (this.hasLocalStorage) {
        var nick = localStorage.getItem("nick");
        console.log('retrieve nick: ', nick);
        if ( nick ) {
            this.setNick(nick);
        }
    }

    this.socket.on('list', function (msg) {
        console.log('list', msg);
        //call this.options.cb_list
    });

    //Internal callbacks process
    //Store the current nick
    this.socket.on('nick', function (new_nick) {
        that.nick = new_nick;
    });
}



function nickChange (nick) {
    console.log('nickChange ',nick);
    estimate.setNick(nick);
}

//Send the points
function sendPoints (points) {
    console.log('send '+points);
    estimate.sendPoints(points);
}

var estimate;

function init() {
    //instantiate conn class
    estimate = new Estimate({
        _cb_nickchange: nickChange,
             _cb_list: function(data){console.log('list', data);},
    });
}
//onLoad
$(function(){
    //ask for a name
    init();

    var name = getCookie('estimate_name');
    if (name == null) {
        name = prompt("Can I have your name please?");
        setCookie('estimate_name', name, 365);
    }
    nickChange(name);


    $('#values li').click(function(){
        $('#values li').removeClass('selected');
        sendPoints(parseFloat($(this).text()));
        $(this).addClass('selected');
    });


});