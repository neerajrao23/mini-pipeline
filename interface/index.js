import express from "express";
import fs from "fs";

const PORT = 4000;
const app = express();
app.use(express.json());
app.use(express.static("public")); // Serve CSS/images

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", "./views");

// GET /health
app.get("/health", (req, res) => {
  res.send({ ok: true });
});

// GET /guides/:id
app.get("/guides/:id", (req, res) => {
  const guideId = req.params.id;

  fs.readFile("received.json", "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading received.json");

    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).send("Invalid JSON in received.json");
    }

    if (json.guide_id.toString() !== guideId) {
      return res.status(404).send("Guide not found");
    }

    // Render EJS template
    res.render("guide", {
      guideId,
      steps: json.steps,
    });
  });
});

// POST /callbacks/steps
app.post("/callbacks/steps", (req, res) => {
  const { guide_id, steps } = req.body;

  if (!guide_id || !Array.isArray(steps)) {
    return res.status(400).json({ error: "Invalid JSON structure" });
  }

  fs.writeFile("received.json", JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).json({ error: "Failed to save JSON" });
    res.json({ ok: true, message: "JSON received and saved" });
  });
});

app.listen(PORT, () => {
  console.log(`Interface service running on ${PORT}`);
});
