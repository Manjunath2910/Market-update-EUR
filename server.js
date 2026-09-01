require("dotenv").config();
console.log("STEP 1");

const express = require("express");
const path = require("path");
console.log("STEP 2");


const axios = require("axios");
console.log("STEP 3");
const cors = require("cors");
console.log("STEP 4");

const cloudinary = require("cloudinary").v2;
console.log("STEP 5");
const multer = require("multer");
console.log("STEP 6");


const app = express();
console.log("STEP 7");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
console.log("STEP 8");

const storage = multer.memoryStorage();
const upload = multer({ storage });
console.log("STEP 9");


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
console.log("STEP 10");

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});


app.post("/upload", upload.single("image"), async (req, res) => {

    console.log("===== /upload called =====");

    try {

        if (!req.file) {
            console.log("No file received");
            return res.status(400).json({
                success: false,
                error: "No image uploaded"
            });
        }

        console.log("Uploading to Cloudinary...");

        const result = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "market-update"
                },
                (error, result) => {

                    if (error) {
                        console.log(error);
                        return reject(error);
                    }

                    resolve(result);
                }
            );

            stream.end(req.file.buffer);

        });

        console.log("Cloudinary URL:");
        console.log(result.secure_url);

        res.json({
            success: true,
            imageUrl: result.secure_url
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

app.post("/publish", async (req, res) => {

    try {

        const { imageUrl, caption, mediaType } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                error: "Image URL is required."
            });
        }

        const isStory = mediaType === "story";
        console.log(isStory ? "Publishing as STORY" : "Publishing as FEED post");

        // Step 1: Create media container
        // For a Story, set media_type=STORIES (captions are ignored for stories).
        const containerParams = {
            image_url: imageUrl,
            access_token: process.env.ACCESS_TOKEN
        };
        if (isStory) {
            containerParams.media_type = "STORIES";
        } else {
            containerParams.caption = caption;
        }

        const media = await axios.post(
            `https://graph.facebook.com/v25.0/${process.env.INSTAGRAM_ID}/media`,
            null,
            { params: containerParams }
        );

        const creationId = media.data.id;

        console.log("✅ Media Container Created:", creationId);

        // Step 2: Wait until Meta finishes processing the image
        let status = "IN_PROGRESS";
        let attempts = 0;

        while (status === "IN_PROGRESS" && attempts < 20) {

            await new Promise(resolve => setTimeout(resolve, 3000));

            const check = await axios.get(
                `https://graph.facebook.com/v25.0/${creationId}`,
                {
                    params: {
                        fields: "status_code",
                        access_token: process.env.ACCESS_TOKEN
                    }
                }
            );

            status = check.data.status_code;
            attempts++;

            console.log(`Attempt ${attempts}: ${status}`);
        }

        if (status !== "FINISHED") {
            return res.status(500).json({
                success: false,
                error: "Image processing failed or timed out.",
                status
            });
        }

        console.log("✅ Image Ready for Publishing");

        // Step 3: Publish the image
        const publish = await axios.post(
            `https://graph.facebook.com/v25.0/${process.env.INSTAGRAM_ID}/media_publish`,
            null,
            {
                params: {
                    creation_id: creationId,
                    access_token: process.env.ACCESS_TOKEN
                }
            }
        );

        console.log("✅ Successfully Published");

        res.json({
            success: true,
            post_id: publish.data.id
        });

    } catch (err) {

        console.error(err.response?.data || err.message);

        res.status(500).json(
            err.response?.data || {
                error: err.message
            }
        );

    }
    

});
// (Root "/" now serves public/index.html via express.static above.)


const PORT = process.env.PORT || 3000;

console.log("STEP 11");

app.listen(PORT, () => {
     console.log("STEP 12");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});