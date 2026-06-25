const videoModel = require('../models/Video');

exports.getVideos = async (req, res) => {
  try {
    const videos = await videoModel.find().select("videoTitle videoDescription videoAuthor dateOfPublish");

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des vidéos",
      error: error.message,
    });
  }
};