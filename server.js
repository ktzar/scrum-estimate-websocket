//Constants
var SERVER_PORT = 1080;

var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')
, util = require('util')
, mime = require('./lib/mime')


app.listen(SERVER_PORT);

//HTTP handler
function handler (req, res) {

    //Room list
    if (req.url.indexOf("/master") == 0 ) {
        //Elsewhere, redirect to the static page
        res.writeHead(302, {
            'Location': '/static/master.html'
        });
        res.end();
    }else if (req.url.indexOf("/static/")==0) {
    //Dump any existing file in the /static folder
        var file = req.url;
        //Read the desired file and output it
        fs.readFile(__dirname + '/'+file,
            function (err, file_data) {
                if (err) {
                    res.writeHead(500);
                    res.end('Not found '+req.url);
                } else {
                    // returns MIME type for extension, or fallback, or octet-steam
                    var extension = file.substr(file.lastIndexOf('.'));
                    var mime_type = mime.lookupExtension(extension);
                    res.writeHead(200, {'Content-Type' : mime_type});
                    res.end(file_data);
                }
            }
        );
    } else {
        //Elsewhere, redirect to the static page
        res.writeHead(302, {
            'Location': '/static/index.html'
        });
        res.end();
    }

}


//TODO put this in a module
var createChat = function(room_name){

    var contacts = {};
    var user_count = 0;

    io.on('connection', function (socket) {

        var refreshContactList = function () {
            console.log(contacts);
            io.sockets.emit('list', contacts);
        };


        //If the client doesn't set any nickname it'll remain Anonymous
        var _this = this;

        var nick = "Anonymous_"+user_count++;
        socket.set('nick', nick);
        contacts[socket.id] = {'nick':nick};

        //Set nickname to the user
        socket.emit('nick', nick);

        contacts[socket.id] = {name:nick,points:0};
        refreshContactList();

        //Message to the Room
        socket.on('points', function (message) {
            if (message == undefined || message.length == 0 ) {
                console.log('Empty message');
                return;
            }
            contacts[socket.id]['points'] = parseFloat(message);
            //Get the nickname
            var nick = contacts[socket.id]['nick'];
            console.log("Send ",nick, message);
            refreshContactList();
        });

        //User disconnects
        socket.on('disconnect', function () {
            socket.get('nick', function(err, nick) {
                //delete this user from contact list
                delete contacts[socket.id];
                console.log(nick+" left");
                refreshContactList();
            });
        });
    });
};

createChat();
  
//Debug memory usage every 10s
setInterval(function(){
    console.log("Memory",util.inspect(process.memoryUsage()));
}, 10*1000);
