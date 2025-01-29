import { exec } from "child_process";
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

export async function convert(req, res) {
  const { url } = req.body;

  // Check if the URL is provided and valid
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send({ error: "Invalid YouTube URL" });
  }

  try {
    // Extract the video ID from the URL
    const videoId = ytdl.getURLVideoID(url);

    // Define the output path for the MP3 file
    const outputDir = "./downloads";
    const outputPath = path.join(outputDir, `${videoId}.mp3`);

    // Ensure the downloads directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Use yt-dlp to download and convert the video to MP3
    exec(
      `yt-dlp -x --audio-format mp3 -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error during conversion:", error.message);
          return res.status(500).send({ error: "Failed to convert video to MP3" });
        }

        // Check if the file exists before sending it
        if (!fs.existsSync(outputPath)) {
          return res.status(500).send({ error: "Converted file not found" });
        }

        // Send the file as a response and delete it after download
        res.download(outputPath, `${videoId}.mp3`, (err) => {
          if (err) {
            console.error("Error during file download:", err.message);
          }

          // Delete the file after download
          fs.unlinkSync(outputPath);
        });
      }
    );
  } catch (err) {
    console.error("Error fetching video info:", err.message);
    return res.status(500).send({ error: "Failed to process the request" });
  }
}