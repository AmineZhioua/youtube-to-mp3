import { exec } from "child_process";
import fs from "fs";
import ytdl from "ytdl-core";

export async function convert(req, res) {
  const { url } = req.body;

  // Check if the URL is provided and valid
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send({ error: "Invalid YouTube URL" });
  }

  try {
    // Extract the video URL from the playlist if it's a playlist URL
    const videoUrl = ytdl.getURLVideoID(url) ? url : ytdl.getURLVideoID(url); // This ensures we extract the video ID

    const outputPath = `./downloads/audio.mp3`;

    exec(`yt-dlp -x --audio-format mp3 -o "${outputPath}" ${videoUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error during conversion:", error.message);
        return res.status(500).send({ error: "Failed to convert video to MP3" });
      }

      // Check if the file exists before sending it
      if (!fs.existsSync(outputPath)) {
        return res.status(500).send({ error: "Converted file not found" });
      }

      // Send the file as a response and delete it after download
      res.download(outputPath, `audio.mp3`, (err) => {
        if (err) {
          console.error("Error during file download:", err.message);
        }
      });
    });
  } catch (err) {
    console.error("Error fetching video info:", err.message);
    return res.status(500).send({ error: "Failed to process the request" });
  }
}
