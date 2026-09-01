// POST /api/upload  { image: "data:image/jpeg;base64,..." }
// Uploads the image to Cloudinary and returns the hosted URL.
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const image = body && body.image;
    if (!image) return res.status(400).json({ success: false, error: "No image uploaded" });

    const result = await cloudinary.uploader.upload(image, { folder: "market-update" });
    return res.json({ success: true, imageUrl: result.secure_url });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
