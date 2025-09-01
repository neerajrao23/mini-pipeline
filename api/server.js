import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 8000;
const AUTH_TOKEN = process.env.IMPORT_TOKEN;
const ALLOWED_MIME = ["video/mp4", "video/quicktime", "video/x-msvideo"];

const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());

//root
app.get("/", (req, res) => {
  res.send("api server Working");
});

//middleware
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Invalid Authorization token" });
  }

  next();
}

//helper
function isValidUrl(video_url) {
  try {
    new URL(video_url);
    return true;
  } catch {
    return false;
  }
}

//mocked json response
const MOCKED_RESPONSE = {
  guide_id: 67,
  steps: [
    {
      index: 1,
      second: 5,
      title: "Frame 00:05",
      image_url:
        "https://images.unsplash.com/photo-1676380363734-f2f932ff5981?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      index: 2,
      second: 10,
      title: "Frame 00:10",
      image_url:
        "https://images.unsplash.com/photo-1676380362680-85260af12dca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      index: 3,
      second: 15,
      title: "Frame 00:15",
      image_url:
        "https://images.unsplash.com/photo-1676380367878-c79a5f40edb6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ],
};

// GET /health
app.get("/health", (req, res) => {
  res.send({ ok: true });
});

// POST /process-video
app.post(
  "/process-video",
  authenticate,
  upload.single("video"),
  async (req, res) => {
    // File upload
    if (req.file) {
      if (!ALLOWED_MIME.includes(req.file.mimetype)) {
        return res.status(422).json({ error: "Invalid video file type" });
      }
    }
    // Remote URL
    else if (req.body.video_url) {
      const video_url = req.body.video_url;
      if (!isValidUrl(video_url)) {
        return res.status(422).json({ error: "Invalid video URL" });
      }
      if (!/\.(mp4|mov|avi)(\?.*)?$/i.test(video_url)) {
        return res
          .status(422)
          .json({ error: "URL must point to a video file" });
      }
    }
    // Invalid: neither file nor URL provided
    else {
      return res.status(422).json({
        error:
          "Invalid input: either upload file or provide JSON { video_url }",
      });
    }

    // Send response to client
    res.json(MOCKED_RESPONSE);

    // Always send JSON to Interface service by default if callback_url not specified
    const INTERFACE_URL =
      req.body.callback_url || "http://interface:4000/callbacks/steps";

    try {
      await axios.post(INTERFACE_URL, MOCKED_RESPONSE, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(`JSON sent to Interface at ${INTERFACE_URL}`);
    } catch (err) {
      console.error(`Failed to send JSON to Interface: ${err.message}`);
    }
  }
);

app.listen(PORT, () => {
  console.log(`Api server listening on ${PORT}`);
});
