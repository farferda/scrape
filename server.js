var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var expressHandlebars = require("express-handlebars");
var request = require("request");
var axios = require("axios");
var db = require("./models")
var PORT = 3000;

// Initialize Express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
});

app.get("/home", function(req,res){
    console.log("we hit home");
    db.Article.find({}).then(function(stuffFromDb){
        console.log("stuf from db", stuffFromDb);
        res.render("home", {articles: stuffFromDb});
    })
    
})


// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.reddit.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
        
      // Now, we grab every h2 within an article tag, and do the following:
      $(".title").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
          if(result.title.length>0){
              if(result.link.charAt(0)=== "/"){
                  result.link = "www.reddit.com"+ result.link;
              }
            console.log("result", result)
            db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                return res.json(err);
            });
          }
  
 
        // db.Article.create(result)
        //   .then(function(dbArticle) {
        //     // View the added result in the console
        //     console.log(dbArticle);
        //   })
        //   .catch(function(err) {
        //     // If an error occurred, send it to the client
        //     return res.json(err);
        //   });
      });
  
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
  });



app.listen(PORT, function(){
    console.log("listening on",PORT)
})

