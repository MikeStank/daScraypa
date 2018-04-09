var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Comments = require("./models/comment.js")
var CommentSchema = require("./models/saved.js")
// Require all models
// var db = require("./models");


// add in the scraping programs!!!
var request = require("request");
var cheerio = require("cheerio");

// initialize the app
var app = express();
var PORT = process.env.PORT || 3000;

// ========= Configure middleware!!!!!!!!!!!!!!!!!!!!! =========
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://heroku_574fk3qr:i6v66stn23jhncg3ooutj5u3if@ds239009.mlab.com:39009/heroku_574fk3qr", {
  useMongoClient: true
});
var db = mongoose.connection;

//hook mongojs config to db var --> replaced with Mongoose connection
//var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database error message: " + error);
});

db.once("open", function () {
    console.log("Mongoose connection successful.");
});
//Main route

//SCRAPE the DATA!
//define scrape route
app.get("/saved", function (req, res) {
    //make request
    request("http://reactkungfu.com/", function (error, response, html) {
        //load html from request into cheerio
        var $ = cheerio.load(html);
        //tell it what to find and what to do with it, for each hgroup...
        $('hgroup').each(function (i, element) {
            var result = {};
            //declare variable and save html bit you want
            result.title = $(this).children('h1').children('a').text();
            //what else do you want? declare and store for each instance of element
            result.link = $(this).children('h1').children('a').attr("href");
            //var firstLine = $('this').parent('header').next('.post-lead').children('p').html();
            //for now lets console log the info....
            //console.log(title); -->successfully printed to console! yay... moving on
            //if both of these exist, save to the database!
            var entry = new DataScrape(result);
            entry.save(function (err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                    console.log(doc);
                }
            });
        });
    });
    // res.send("Scrape Complete");
    res.redirect("/");
    console.log("Consider the page scraped baybayyyyyyyyeeeeee!!!!!!!!");
});


//simple index
app.get("/", function (req, res) {
    res.send(index.html);
});

//Retrieve the SCRAPED data from the database
app.get("/articles", function (req, res) {
    HwScrapedData.find({})
        .populate("notes")
        .exec(function (error, dbResult) {
            if (error) {
                console.log(error);
            } else {
                res.json(dbResult);
            }
        });
});

// Route to see notes we have added
app.get("/notes", function (req, res) {
    // Find all notes in the note collection with our Note model
    Note.find({}, function (error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Or send the doc to the browser
        else {
            res.send(doc);
        }
    });
});

// Grab an article by it's ObjectId and show the notes
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    HwScrapedData.findOne({
            "_id": req.params.id
        })
        // ..and populate all of the notes associated with it
        .populate("notes")
        // now, execute our query
        .exec(function (error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
                console.log(doc);
            }
        });
});



// New note creation via POST route
app.post("/submit/:id", function (req, res) {
    // Use our Note model to make a new note from the req.body
    var newNote = new Note(req.body);


    // Save the new note to mongoose
    newNote.save(function (error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Otherwise
        else {
            // Find our user and push the new note id into the User's notes array
            HwScrapedData.findOneAndUpdate({
                "_id": req.params.id
            }, {
                $push: {
                    "notes": doc._id
                }
            }, {
                new: true
            }, function (err, newdoc) {
                // Send any errors to the browser
                if (err) {
                    res.send(err);
                }
                // Or send the newdoc to the browser
                else {
                    res.send(newdoc);
                }
            });
        }
    });
});
app.listen(PORT, function() {
    console.log("app listening on PORT", PORT);
});
