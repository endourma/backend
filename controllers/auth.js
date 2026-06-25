const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription
exports.signup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      username,
      password: hashedPassword,
    });

    await user.save();

    // Génération du token à l'inscription
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Stockage du token dans un cookie sécurisé
    res.cookie("token", token, {
      httpOnly: false,      // inaccessible en JS (sécurité XSS)
      secure: false, // seulement HTTPS en prod
      sameSite: "lax",  // évite CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours en ms
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `${field} already in use..` });
    }
    res.status(500).json({ error: err.message });
  }
};

// Connexion
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérification utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not found.." });
    }

    // Vérification mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Wrong password.." });
    }

    // Pas de nouveau token : on ne fait que valider la connexion
    res.status(200).json({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      message: "Connected successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};