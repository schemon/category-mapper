var restify = require('restify');
var fs = require('fs');
var request = require('request');


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

server.get('/category/tree/:id', function(req, res, next) {
  getFile(getCatFileUri(req.params.id), function(data) {
    res.send(JSON.parse(data));
    next();
  });
});

server.get('/category/tree/:id/map', function(req, res, next) {
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


server.post('/category/tree', function(req, res, next) {
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
      url: "http://huvuddator.ddns.net/category/tree/" +id +"/map"
    });
    next();
  });
});



server.get('/category/icon/:storeName', function(req, res, next) {
  var url = "https://appdoor2cache.appland.se/api/cdn?REQ=%7B%22CategoryListReq%22%3A%7B%22clientPlatform%22%3A%221%22%2C%22language%22%3A%22en%22%2C%22pv%22%3A800%2C%22store%22%3A%22"
  +req.params.storeName
  +"%22%7D%7D";
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var resp = JSON.parse(body);
      var cats = resp.CategoryListResp.category;
      var version = parseInt(cats[0].iconUri.split('/')[5]) + 1;

      var catScript = cats.filter(function(item) {
        return item.parentCategoryId == 0;
      }).map(function(item) {
        return item.iconUri;
      }).reduce(function(result, item, index) {
        if(index == 1) {
          result = formatIconItem(result);
        }

        return result + formatIconItem(item);
      });


      catScript = "mkdir " +version 
        +"<br>echo " +version +" > placeholder"
        +"<br>cd " +version
        +"<br>" +catScript;


      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(catScript);

    } else {
      res.send('error: ' +error);
    }
    next();

  });
});

function formatIconItem(item) {
  return '<br>' +'wget ' +item;
}

server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});

