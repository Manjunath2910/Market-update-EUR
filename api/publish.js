// POST /api/publish  { imageUrl, caption, mediaType }
// Publishes the image to Instagram as a feed post or a story (media_type=STORIES).
const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const { imageUrl, caption, mediaType } = body || {};
    if (!imageUrl) return res.status(400).json({ error: "Image URL is required." });

    const IG = process.env.INSTAGRAM_ID;
    const TOKEN = process.env.ACCESS_TOKEN;
    const isStory = mediaType === "story";

    // Step 1: create the media container
    const containerParams = { image_url: imageUrl, access_token: TOKEN };
    if (isStory) containerParams.media_type = "STORIES";
    else containerParams.caption = caption;

    const media = await axios.post(
      `https://graph.facebook.com/v25.0/${IG}/media`,
      null,
      { params: containerParams }
    );
    const creationId = media.data.id;

    // Step 2: wait until Instagram finishes processing the image
    let status = "IN_PROGRESS";
    let attempts = 0;
    while (status === "IN_PROGRESS" && attempts < 15) {
      await new Promise((r) => setTimeout(r, 3000));
      const check = await axios.get(`https://graph.facebook.com/v25.0/${creationId}`, {
        params: { fields: "status_code", access_token: TOKEN },
      });
      status = check.data.status_code;
      attempts++;
    }
    if (status !== "FINISHED") {
      return res.status(500).json({ success: false, error: "Image processing failed or timed out.", status });
    }

    // Step 3: publish
    const publish = await axios.post(
      `https://graph.facebook.com/v25.0/${IG}/media_publish`,
      null,
      { params: { creation_id: creationId, access_token: TOKEN } }
    );

    return res.json({ success: true, post_id: publish.data.id });
  } catch (err) {
    return res.status(500).json(err.response ? err.response.data : { error: err.message });
  }
};
