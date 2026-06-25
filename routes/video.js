const express = require("express");
const router = express.Router();
const multer = require("multer");

const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Video = require("../models/Video"); // modèle Mongo
require("dotenv").config();

// Multer → stockage en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Config client R2 (URL dev, pas de Custom Domain)
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload vidéo
router.post("/upload", upload.single("videoFile"), async (req, res) => {
  try {
    const { videoTitle, videoDescription } = req.body;
    const videoAuthor = req.cookies.username || "unknown";
    const userId = req.cookies.userId || "anon";

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    // Nom de fichier unique
    const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${uniqueId}${fileExt}`;

    // Chemin dans le bucket R2
    const key = `uploads/${userId}/${fileName}`;

    // Upload sur R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    // URL dev R2 pour navigateur
    const fileUrl = `https://${process.env.R2_DEV}.r2.dev/${key}`;

    // Enregistrement dans MongoDB
    const newVideo = new Video({
      title: videoTitle,
      description: videoDescription,
      author: videoAuthor,
      userId: userId,
      url: fileUrl,
      dateOfPublish: new Date(),
    });

    await newVideo.save();

    res.status(201).json({
      message: "Vidéo uploadée avec succès",
      video: newVideo,
    });
  } catch (err) {
    console.error("Erreur upload R2:", err);
    res.status(500).json({ error: "Échec upload vidéo" });
  }
});

// Récupérer toutes les vidéos depuis Mongo
router.get("/get-all", async (_req, res) => {
  try {
    const videos = await Video.find().sort({ dateOfPublish: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les vidéos" });
  }
});

module.exports = router;