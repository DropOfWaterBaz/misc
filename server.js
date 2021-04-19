var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var qs = require('querystring');  
var mimeTypes = {
           "html": "text/html",
           "jpeg": "image/jpeg",
           "jpg": "image/jpeg",
           "png": "image/png",
           "js": "text/javascript",
           "css": "text/css"};
var databaseUrl = "test"; 
var collections = ["testData"]
var express = require('express'),
    app = express();
app.use(express.static('‎⁨Macintosh HD⁩/Users/⁨dbaz⁩/⁨FYP'))


var db = require("mongojs").connect(databaseUrl, collections);
var server = http.createServer(function onRequest(request, response) {
       var urlParts = url.parse(request.url);
       var fullPath = urlParts.pathname;
       var page = 'pages' + urlParts.pathname;
       var jsonUserOject = '';
       if (fullPath == "/post") {
            var userName = '';
               request.on('data', function(chunk) {
               jsonUserObject = JSON.parse(chunk.toString());
               userName = jsonUserObject.name;
               userEmail = jsonUserObject.email;
               db.testData.insert({name: userName, email: userEmail}, function(err, testData) {
                   if( err || !testData) console.log("Unable to add user");
                   });
               });
       }
    var mimeType = mimeTypes[path.extname(page).split(".")[1]];
    fs.exists(page, function fileExists(exists) {
              if (exists) {
                   response.writeHead(200, mimeType);
                   fs.createReadStream(page).pipe(response);
              } else {
                   response.write('Page Not Found');
                   response.end();
              }
    });
}).listen(3300);

/*var http = require('http');
var fs = require("fs");

http.createServer(function(request, response) {
  if(/(.*?).css$/.test(request.url.toString())){
     sendFileContent(response, request.url.toString().substring(1), "text/css");
  }else if(/(.*?).js$/.test(request.url.toString())){
    sendFileContent(response, request.url.toString().substring(1), "text/javascript");
  }else if(/(.*?).html$/.test(request.url.toString())){
    sendFileContent(response, request.url.toString().substring(1), "text/html");
  }else if(request.url.toString().substring(1) == ''){
    sendFileContent(response, "index.html", "text/html");
  }
}).listen(3000);

function sendFileContent(response, fileName, contentType){
  fs.readFile(fileName, function(err, data){
    if(err){
      response.writeHead(404);
      response.write("Not Found!");
    }
    else{
      response.writeHead(200, {'Content-Type': contentType});
      response.write(data);
    }
    response.end();
  });
}


/*const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
// Connect to mongoDB database
const mongoURL = 'mongodb+srv://dbaz:<password>@cluster0.vd8fe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const mongoURL = 'mongodb://<dbaz>:<barry69420>@<host>:<8000>/<MyFirstDatabase>';
//mongoose.connect(mongoURL);
// Routing
// Configure port
const port = 8080;
// Listen to port
app.listen(port);
console.log(`Server is running on port: ${port}`);*/



// run server
// ruby -run -ehttpd . -p8000
// http://localhost:8000