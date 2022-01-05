require('dotenv').config({ path: "sample.env" });
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
//const { Db } = require('mongodb');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;
const urlSchema = new Schema ({
  originalUrl : {type: String, required: true},
  shortUrl :  String
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
let DbUrl = mongoose.model('url', urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", function(req, res) {
    let originalUrl = req.body.url;
    let regExp = /^(ftp|http|https):\/\/[^ "]+$/
    if (regExp.test(originalUrl) == false) {
      res.json({ error: 'invalid url'});
    }
    
    DbUrl.estimatedDocumentCount({}, async(err, numUrls) => {
      
      if (err) return console.log (err);
      let shortUrl = "https://boilerplate-project-urlshortener-1.maxiconstancio.repl.co/api/shorturl/" + numUrls; 
      let originUrl = new DbUrl({originalUrl: originalUrl,shortUrl })
      originUrl.save(function(err, data) {
      if (err) return console.error(err);   
      });
      
      res.json({ url: originalUrl, shortUrl}); 
      console.log (numUrls);
    });
    
  
});
// URL Shortener
app.get('/api/shorturl/:url?', function(req, res) {
  let fullUrl ="https://boilerplate-project-urlshortener-1.maxiconstancio.repl.co" + "/api/shorturl/" + req.params.url
  DbUrl.findOne({shortUrl: fullUrl}, async (err, urlFound) => {
    if (err) return console.log(err);
    if (urlFound === null || urlFound === undefined) {
      res.json({'error': "Provided URL is not found in our database"})
    } else {
      
      res.redirect(301, urlFound.originalUrl)
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
