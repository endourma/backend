const Video = require("../models/Video");

exports.uploadVideo = async (req, res) => {
  try {
    const { videoTitle, videoDescription, dateOfPublish } = req.body;

    // Récupération de l'auteur depuis les cookies
    const videoAuthor = req.cookies.username;
    if (!videoAuthor) return res.status(401).json({ message: "Non authentifié" });

    // Vérification que le fichier est présent
    if (!req.file) return res.status(400).json({ message: "Aucun fichier vidéo fourni" });

    // Création de l'objet vidéo avec toutes les infos
    const newVideo = new Video({
      videoTitle: videoTitle || "Sans titre",
      videoDescription: videoDescription || "",
      videoAuthor,
      dateOfPublish: dateOfPublish || new Date().toISOString(),
      fileName: req.file.filename, // nom du fichier côté serveur
    });

    await newVideo.save();

    res.status(200).json({
      message: "Vidéo uploadée avec succès",
      video: {
        id: newVideo._id,
        title: newVideo.videoTitle,
        description: newVideo.videoDescription,
        author: newVideo.videoAuthor,
        dateOfPublish: newVideo.dateOfPublish,
        fileName: newVideo.fileName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
    logger.info("Route test 'video' appelée");
  }
};