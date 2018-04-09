// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Create a NoteSchema with the Schema class
var DataScrape = new Schema({
  // title: a string
  title: {
    type: String
    required: true,
  },
  // body: a string
  link: {
    type: String,
    required: true,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment",
  }]
});

// Make a Note model with the NoteSchema
var DataScrape = mongoose.model("DataScrape", DataScrape);

// Export the Note model
module.exports = DataScrape;
