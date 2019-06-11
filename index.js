/*
* Primary file for the homework api
*
*/

var http = require('http');
var url = require('url');
var stringDecoder = require("string_decoder").StringDecoder;



//Defining the handlers for a request
handlers = {};
handlers.hello = function(data,callback){
    callback(200, {'message': "Hello, you're using Jose's restful API"});
}

handlers.notFound = function(data, callback){
    callback(404);
}

// Define a request router
var router = {
    'hello': handlers.hello
}
// Declaring the server variable and all the logic is written inside of it
var server = http.createServer(function(req, res){
    // Parsing the url
    var parsedURL = url.parse(req.url, true);
    
    // Getting the path for the URL
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Getting the query string as an object
    var queryStringObject = parsedURL.query

    // Getting the method of the request
    var method = req.method.toLowerCase();
    
    // Getting the headers of the request
    var headers = req.headers;

    // Getting the payload  if any exists
    var decoder = new stringDecoder('utf-8');
    var buffer = ''

    // Turning bit streams into UTF-8 string
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        // Choosing the handler this request should go to, if it doesn't exist use the notFound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Constructing the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'headers' : headers,
            'payload' : buffer
        };

        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler or the default status code 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or a default empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Send the response
            res.setHeader('Content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });

});

// Starting the server on port 3000
server.listen(3000, function(){
    console.log("The server is listening on port 3000");
});