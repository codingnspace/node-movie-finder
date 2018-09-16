var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
const request = require('request');
var bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// app.use('/', express.static(path.join(__dirname, 'public')));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// app.use(express.static(path.join(__dirname, "public")));
app.get('/', function (req, res) {
  res.render('index');
});

app.post('/', function (req, res) {
  var searchKeywords = req.body.keyword;
  var url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${searchKeywords}`;
  request(url, function (err, response, body) {
      if(err){
        res.render('index', {movies: null, error: 'Error, please try again'});
      } else {
        var movies = JSON.parse(body);
          res.render('index', {movies: movies.Search, error: null});
      }
  });
})

app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.get('favorites', function(req, res){
  if(!req.body.name || !req.body.oid){
    res.send("Error");
    return
  
  var data = JSON.parse(fs.readFileSync('./data.json'));
  data.push(req.body);
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
  }
});

app.listen(3000, function(){
  console.log("Listening on port 3000");
});