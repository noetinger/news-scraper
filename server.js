const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const methodOverride = require('method-override');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsscraper", {
    useNewUrlParser: true
});

// Require all models
var db = require("./models");

var PORT = 3000;

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/mongo-news-scraper");
//define local mongoDB URI
// if(process.env.MONGODB_URI){
//     //THIS EXECUTES IF THIS IS IN HEROKU
//     mongoose.connect(process.env.MONGODB_URI);
// }else {
//     mongoose.connect("mongodb://localhost/mongo-news-scraper")
// }

// var db = mongoose.connection;

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

// Once logged in to the db through mongoose, log a success message
// db.once("open", function() {
//   console.log("Mongoose connection successful.");
// });


// Routes
//Route to scrape the article
app.get("/scrape", function (req, res) {
    //Grab body of the HTML
    axios.get("https://buffalonews.com/section/local-news/").then(function (response) {
        var $ = cheerio.load(response.data);
        //Grab the elements/tags (ex: article h2)
        $("headline").each(function (i, element) {
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
})

//Route for getting all articles from db
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Route for getting a specific article by id and corresponding note
app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err);
    });
});

//Route for saving/updating an articles note
app.post("/articles/:id", function(req, res){
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    })
})

//Route for saving/updating an article to be saved

//Route for getting saved article

//Route for deleting/updating saved article


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});