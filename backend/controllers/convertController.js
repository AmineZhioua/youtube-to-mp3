import { exec } from "child_process";
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

export async function convert(req, res) {
  const { url } = req.body;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send({ error: "Invalid YouTube URL" });
  }

  try {
    const videoId = ytdl.getURLVideoID(url);

    const outputDir = "./downloads";
    const outputPath = path.join(outputDir, `${videoId}.mp3`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    exec(
      `yt-dlp -x --audio-format mp3 -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`,
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