// const getVideos = require("./getVideos");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

app.use(cors());

const { Pool } = require("pg");

const db = new Pool({
  // user: process.env.DB_USERNAME,
  // host: process.env.DB_HOST,
  // database: process.env.DB_DATABASE,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getVideos = async (db) => {
  try {
    const result = await db.query("SELECT id, title, url, rating FROM videos");
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// GET "/"
app.get("/", async (req, res) => {
  try {
    const videos = await getVideos(db);
    let orderedVideos = [...videos];

    const order = req.query.order;
    if (order === "asc") {
      orderedVideos.sort((a, b) => a.rating - b.rating);
    } else {
      orderedVideos.sort((a, b) => b.rating - a.rating);
    }

    res.json(orderedVideos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET "/search"
app.get("/search", async (req, res) => {
  try {
    const videos = await getVideos(db);
    const searchTerm = req.query.term;
    if (!searchTerm) {
      return res
        .status(400)
        .json({ result: "failure", message: "Search term is required." });
    }

    const matchedVideos = videos.filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    res.json(matchedVideos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET "/:id"
app.get("/:id", async (req, res) => {
  try {
    const videos = await getVideos(db);

    const videoId = parseInt(req.params.id);

    const video = videos.find((v) => v.id === videoId);
    if (!video) {
      return res
        .status(404)
        .json({ result: "failure", message: "Video not found." });
    }

    res.json(video);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST "/"
app.post("/", bodyParser.json(), async (req, res) => {
  try {
    console.log({ body: req.body });
    const { title, url } = req.body;

    // Check if title and URL are provided
    if (!title || !url) {
      return res.status(400).json({
        result: "failure",
        message: "Both title and URL are required.",
      });
    }

    // Validate YouTube URL
    const youtubeUrlRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
    if (!youtubeUrlRegex.test(url)) {
      return res
        .status(400)
        .json({ result: "failure", message: "Invalid YouTube URL." });
    }

    const newVideo = {
      id: Math.floor(Math.random() * 900000) + 100000,
      title,
      url,
      rating: 0,
    };

    const query =
      "INSERT INTO videos (id, title, url, rating) VALUES ($1, $2, $3, $4)";
    const values = [newVideo.id, newVideo.title, newVideo.url, newVideo.rating];

    await db.query(query, values);

    res.json({ id: newVideo.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/:id", bodyParser.json(), async (req, res) => {
  try {
    console.log({ body: req.body });
    const videoId = parseInt(req.params.id);

    const { isUpVote } = req.body;

    // Get video with id
    // Get vote number of video
    // Add/Minus vote number by one
    // Update the new vote numer

    const query = `SELECT rating FROM videos WHERE id = ${videoId}`;
    const rows = await db.query(query).then((result) => {
      return result.rows;
    });

    if (rows.length > 0) {
      const oldRating = rows[0].rating;
      const newRating = isUpVote ? oldRating + 1 : oldRating - 1;
      await db.query("UPDATE videos SET rating = $1 WHERE id = $2", [
        newRating,
        videoId,
      ]);
    } else {
      console.log("No rows found for the specified videoId:", videoId);
    }

    res.json({ query, rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE "/:id"
app.delete("/:id", async (req, res) => {
  try {
    const videos = await getVideos(db);
    const videoId = parseInt(req.params.id);

    const index = videos.findIndex((v) => v.id === videoId);
    if (index === -1) {
      return res
        .status(404)
        .json({ result: "failure", message: "Video not found." });
    }

    // before database was used: videos.splice(index, 1);

    const query = "DELETE FROM videos WHERE id = $1";
    await db.query(query, [videoId]);

    res.json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
