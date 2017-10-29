'use stict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;
const dburl = process.env.MONGODB_URI || "mongodb://localhost:27017/db";
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
         console.log('inserted', data)
         db.close();
     })

   })

   // request bing api


  res.json({searchValue, offset});
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

  // request bing api


});





module.exports = app;
