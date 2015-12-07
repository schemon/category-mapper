var restify = require('restify');
var fs = require('fs');

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.acceptParser(server.acceptable));
//server.use(restify.bodyParser({ mapParams: false }));


function getCatFileUri(id) {
  return 'db/' +id;
}


function getFile(filename, onSuccess) {
  fs.readFile(filename, 'utf-8', function (err, data) {
    if (err) throw err;
    onSuccess(data);
  });
}

server.get('/category/:id', function(req, res, next) {
  getFile(getCatFileUri(req.params.id), function(data) {
    res.send(JSON.parse(data));
    next();
  });
});

server.get('/category/:id/map', function(req, res, next) {
  getFile(getCatFileUri(req.params.id), function(categoryData) {
    getFile('map.html', function(mapHtml) {
      getFile('map.js', function(mapScript) {
        getFile('map.css', function(mapCss) {

          mapHtml = mapHtml.replace('###mapScript###', mapScript);
          mapHtml = mapHtml.replace('###categoryData###', categoryData);
          mapHtml = mapHtml.replace('###css###', mapCss);

          res.setHeader('Content-Type', 'text/html');
          res.writeHead(200);
          res.end(mapHtml);

          next();
        });
      });
    });
  });
});

function createUUID() {
  var uuid4 = require('uuid4');
  return uuid4().split('-').join('');
}


server.post('/category', function(req, res, next) {
  console.log("saving cat data");
  console.log(req);

  var id = createUUID();
  fs.writeFile(getCatFileUri(id), req.body, function (err) {
    if (err) {
      console.log(err);
      next();
      res.send(err);
    }
    res.send({
      success: true, 
      id: id,
      url: "http://huvuddator.ddns.net/category/" +id +"/map"
    });
    next();
  });
});


server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});
