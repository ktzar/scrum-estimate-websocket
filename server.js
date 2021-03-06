//Constants
var SERVER_PORT = 1080;

//Check parameters for port
if ( typeof process.argv[2] != "undefined") {
    if ( parseInt(process.argv[2],10) > 0) {
        SERVER_PORT = parseInt(process.argv[2],10);
    }else{
        console.log('Usage: node server.js [port_number]');
        process.exit();
    }
}

var app     = require('http').createServer(handler),
    io      = require('socket.io').listen(app),
    fs      = require('fs'),
    util    = require('util'),
    mime    = require('./lib/mime');

io.set('log level', 1);
app.listen(SERVER_PORT);

//HTTP handler
function handler (req, res) {

    //Room list
    if (req.url.indexOf("/master") === 0 ) {
        //Elsewhere, redirect to the static page
        res.writeHead(302, {
            'Location': '/static/master.html'
        });
        res.end();
    }else if (req.url.indexOf("/static/")===0) {
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
var createEstimation = function(){

    var contacts = {};
    var user_count = 0;

    io.on('connection', function (socket) {

        var refreshContactList = function () {
            io.sockets.emit('list', contacts);
        };

        //If the client doesn't set any nickname it'll remain Anonymous
        var _this = this;

        var nick = "Anonymous_"+user_count++;

        contacts[socket.id] = {name:nick,points:0};
        refreshContactList();

        //Message to the Room
        socket.on('nick', function (message) {
            if (message === undefined || message.length === 0 ) {
                return;
            }
            //Check if there's other people connected with the same name and disconnect them
            for (var _contact in contacts) {
                if (contacts[_contact].name === message) {
                    io.sockets.sockets[_contact].disconnect();
                    break;
                }
            }
            if (typeof(contacts[socket.id]) != "undefined") {
                contacts[socket.id].name = message;
            }
            socket.emit('nick', message);
            refreshContactList();
        });

        //Message to the Room
        socket.on('kickout', function (data) {
            console.log("Kickout", data.id);
            if (data.id === undefined || isNaN(data.id)) {
                return;
            }
            console.log('contacts', contacts);
            io.sockets.sockets[data.id].disconnect();
            refreshContactList();
        });

        //Message to the Room
        socket.on('points', function (message) {
            if (typeof message == "undefined" || !message ) {
                return;
            }
            contacts[socket.id].points = parseFloat(message);
            //Get the nickname
            var nick = contacts[socket.id].nick;
            refreshContactList();
        });

        //User disconnects
        socket.on('disconnect', function () {
            socket.get('nick', function(err, nick) {
                //delete this user from contact list
                delete contacts[socket.id];
                refreshContactList();
            });
        });
    });
};

createEstimation();
  
