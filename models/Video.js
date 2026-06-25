const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  userId: String,
  url: String, // lien Cloudflare R2
  dateOfPublish: Date,
});

module.exports = mongoose.model("Video", videoSchema);