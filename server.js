const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

// Our scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

//Require Note and Article Models
const Note = require("./models/Note")
const Article =require("./models/Article")

//Mongo Connection to Heroku
let PORT = process.env.PORT || 3000;
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsscraper";

//Config database
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI)

//Connection Checks
let dbm = mongoose.connection;
dbm.on('error', (error) => {
    console.log('Connection error ${error}');
});

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/newsscraper", {
//     useNewUrlParser: true
// });

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
// Make assets a static folder
app.use(express.static("assets"));

// Require all models
var db = require("./models");

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");


// Routes

//GET requests to render Handlebars pages
app.get("/", function (req, res) {
    db.Article.find({
        "isSaved": false
    }, function (error, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    });
});

app.get("/articles", function (req, res) {
    db.Article.find({
        "isSaved": false
    }, function (error, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    });
});

//Route to scrape the article
app.get("/scrape", function (req, res) {
    //Grab body of the HTML
    axios.get("https://buffalonews.com/section/local-news/").then(function (response) {
        var $ = cheerio.load(response.data);
        //Grab the elements/tags (ex: article h2)
        $("div.headline").each(function (i, element) {
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
        res.end();
    });
})

//Route for getting a specific article by id and corresponding note
app.get("/articles/:id", function (req, res) {
    //Find matching article
    db.Article.findOne({
            _id: req.params.id
        })
        //...and populate all of the notes associated with it.
        .populate("notes") //note or notes?
        //query
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        //log errors
        .catch(function (err) {
            res.json(err);
        });
    console.log("***** Should have Populated******")
});

//Route for saving/updating an article to be saved
app.post("/saved/:id", function (req, res) {
    db.Article
        .findByIdAndUpdate({
            _id: req.params.id
        }, {
            isSaved: true
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
            console.log(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Route for Unsaving/updating an article to be saved
app.post("/Unsaved/:id", function (req, res) {
    db.Article
        .findByIdAndUpdate({
            _id: req.params.id
        }, {
            isSaved: false
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
            console.log(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});


//Route for saving/updating an articles note
app.post("/savedNote/:id", function (req, res) {
    var newNote = new Note({
        body: req.body.body,
        article: req.params.id
    });
    console.log(req.body)
    // And save the new note the db
    newNote.save(function (error, note) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's notes
            Article.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    $push: {
                        "notes": note
                    }
                })
                // Execute the above query
                .exec(function (err) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                        res.send(err);
                    } else {
                        // Or send the note to the browser
                        res.send(note);
                    }
                });
        }
    });
});

//Route for getting saved article
app.get("/savedArticles", function (req, res) {
    db.Article.find({
        "isSaved": true
    }, function (error, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("saved", hbsObject);
    });
});

//Route for deleting an article from the database
app.post("/deleteArticle/:id", function (req, res) {
    db.Article
        .remove({
            _id: req.params.id
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
            console.log(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Route for deleting a Note from the database
app.delete("/notes/delete/:note_id/", function (req, res) {
  // Use the note id to find and delete it
  Note.remove({ "_id": req.params.note_id }, function(err) {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
       // Execute the above query
        .exec(function(err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send("Note Deleted");
          }
        });
    }
  });
});


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});


//Still has bugs with the notes. Don't have the time currently to troubleshoot it. 