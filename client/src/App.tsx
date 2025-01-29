import { useState } from "react"
import axios from "axios"
import { Music2, Loader2, Youtube } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!url) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        API_URL,
        { url },
        {
          responseType: "blob",
        },
      )

      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "audio.mp3";
      link.click();
    } catch (error) {
      console.error(error);
      setError("Failed to convert the video. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Youtube className="w-8 h-8 text-white animate-pulse" />
          <h1 className="text-3xl font-bold text-white">YouTube to MP3</h1>
        </div>

        <div className="space-y-6">
          <div className={`relative transition-all duration-300 ${error ? "shake animate-shake" : ""}`}>
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            {error && <p className="text-red-200 text-sm mt-2">{error}</p>}
          </div>

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Music2 className="w-5 h-5" />
                <span>Convert to MP3</span>
              </>
            )}
          </button>

          <p className="text-white/60 text-sm text-center">
            Download your favorite YouTube videos as MP3 files with just one click!
          </p>
        </div>
      </div>
    </div>
  );
}


export default App;