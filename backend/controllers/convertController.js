import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ytdl from "ytdl-core";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function convert(req, res) {
  const { url } = req.body;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send({ error: "Invalid YouTube URL" });
  }

  try {
    const videoId = ytdl.getURLVideoID(url);
    const outputDir = path.join(__dirname, "downloads");
    const outputPath = path.join(outputDir, `${videoId}.mp3`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Path to the locally downloaded yt-dlp binary
    const ytDlpPath = path.join(__dirname, "yt-dlp");

    exec(
      `${ytDlpPath} -x --audio-format mp3 -o "${outputPath}" ${url}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error during conversion:", error.message);
          return res.status(500).send({ error: "Failed to convert video to MP3" });
        }

        if (!fs.existsSync(outputPath)) {
          return res.status(500).send({ error: "Converted file not found" });
        }

        res.download(outputPath, `${videoId}.mp3`, (err) => {
          if (err) {
            console.error("Error during file download:", err.message);
          }

          fs.unlinkSync(outputPath);
        });
      }
    );
  } catch (err) {
    console.error("Error fetching video info:", err.message);
    return res.status(500).send({ error: "Failed to process the request" });
  }
}
