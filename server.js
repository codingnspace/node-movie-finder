var express = require('express');
var app = express();
var fs = require('fs');
const request = require('request');
var bodyParser = require('body-parser');

// Give server access to environment variables set in .env via process.env.VARIABLE_NAME
require('dotenv').config();

// Allow app to parse nested objects
app.use(bodyParser.urlencoded({ extended: true }));

// Allow JSON to be used
app.use(bodyParser.json());

// Let server know to use Pug library for the view templates
app.set("view engine", "pug");

// GET '/'
// render the index view
app.get('/', function (req, res) {
  res.render('index');
});

// POST '/'
/* use the keywords the user used in search to trigger an omdb api call
which returns a response that includes all movies that fit the search terms
then add error handling
if there's an error with the request, render the index view with an error message
else render the index view with the movies varriable passed in (shape of an array with movie objects) */
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

// GET '/favorites'
app.get('/favorites', function(req, res){
  // Create a javascript array from the JSON in ./data.json
  // data is an array of favorite movie objects
  var data = JSON.parse(fs.readFileSync('./data.json'));
  // render the favorites view with the data array passed in
  res.render('favorites', {favorites: data})
});

// POST '/favorites'
app.post('/favorites', function(req, res){
  var movieId = req.body.movie_id;
  // check to make sure the request includes a movie_id, if not send error message and return
  if(!movieId){
    res.send("Error");
    return
  }
  // parse the json in ./data.json to be a JavaScript array
  var data = JSON.parse(fs.readFileSync('./data.json'));
  // create api request to omdbapi for the exact movie that matches the movieId
  var url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${movieId}`;
  request(url, function (err, response, body) {
    // if there's an error with the request send an error message 
    if(err){
      res.send('Error, please try again');
    } else {
      // else add the movie that found to the data object and data.json and send data
      var movie = JSON.parse(body);
      data.push(movie);
      // return json
      res.setHeader('Content-Type', 'application/json');
      res.send(data)
    }
  });
});

// GET '/movie:id'
app.get('/movie/:id', function(req, res){
  var movieId = req.params.id;
  // check to make sure the request includes a movie_id, if not send error message and return
  if(!movieId){
    res.send("Error");
    return
  }
  // create api request to omdbapi for the exact movie that matches the movieId
  var url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${movieId}`;
  request(url, function (err, response, body) {
    // if there's an error with the request send an error message 
    if(err){
      res.send('Error, please try again');
    } else {
      // else render the movie with with the returned movie object
      var movie = JSON.parse(body);
      res.render('movie', {movie}); 
    }
  });
})

// set express to look in public folder for static resources
app.use(express.static('public'))

// For deploying to heroku, ensure that port number isn't set statically
var port = process.env.PORT || 3000;
// For heroku, use '0.0.0.0' for localhost
var host = '0.0.0.0';

// serve app to given port and host
app.listen(port, host, function(){
  console.log(`Listening on port ${port}`);
});