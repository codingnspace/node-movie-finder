var express = require('express');
var app = express();
var fs = require('fs');
const request = require('request');
var bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.set('views', __dirname + '/views')
app.set("view engine", "pug");

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
  var data = JSON.parse(fs.readFileSync('./data.json'));
  res.render('favorites', {favorites: data})
});

app.post('/favorites', function(req, res){
  var movieId = req.body.movie_id;
  if(!movieId){
    res.send("Error");
    return
  }
  var data = JSON.parse(fs.readFileSync('./data.json'));
  var url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${movieId}`;
  request(url, function (err, response, body) {
    if(err){
      res.send('Error, please try again');
    } else {
      var movie = JSON.parse(body);
      data.push(movie);
      res.setHeader('Content-Type', 'application/json');
      res.send(data); 
    }
  });
});

app.get('/movie/:id', function(req, res){
  var movieId = req.params.id;
  if(!movieId){
    res.send("Error");
    return
  }
  var url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${movieId}`;
  request(url, function (err, response, body) {
    if(err){
      res.send('Error, please try again');
    } else {
      var movie = JSON.parse(body);
      res.render('movie', {movie}); 
    }
  });
})

app.use(express.static('public'))
var port = process.env.PORT || 3000;
var host = '0.0.0.0';
app.listen(port, host, function(){
  console.log("Listening on port 3000");
});