'use stict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;
const dburl = process.env.MONGODB_URI || "mongodb://localhost:27017/db";
const request = require('request');
const path = require('path');
app.use(bodyParser.json());

app.get('/api/imagesearch/:searchValue*', (req, res) => {
   const {searchValue} = req.params;
   const {offset} = req.query;

   // add to resent database
   mongo.connect( dburl, (err, db)=> {
     if (err) throw err;
     let collection = db.collection('recentSearches');

     collection.insert({searchValue, timeSearched: new Date()},
       (err, data) => {
         db.close();
     })

   });

   // request pixabay api
   const url = 'https://pixabay.com/api/?key='+ process.env.API_KEY + "&q=" + encodeURIComponent(searchValue) + "&image_type=photo&per_page=" + offset;
   request(url, (err, response, body) => {
     if (!err && response.statusCode === 200) {
       let results = JSON.parse(body).hits;
       let filteredResults = results.map((cur, i)  => {
         return {
           url: cur.pageURL,
           tags: cur.tags,
           user: cur.user
         }
       })

       res.json(filteredResults)


     } else {
       console.log("Got an error: ", error
       , ", status code: ", response.statusCode)
     }
   });

});

app.get('/api/latest/imagesearch/', (req, res) => {
  // get resent searches from database;
  mongo.connect( dburl, (err, db)=> {
    if (err) throw err;
    let collection = db.collection('recentSearches');

    let results = collection.find().toArray((err, doc) => {
      //console.log(doc)
      res.json(doc);
    })


  })
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname + '/index.html'));

});





module.exports = app;
