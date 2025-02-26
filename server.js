const express = require("express");
const googleTTS = require("google-tts-api");
const fetch = require("node-fetch");

const app = express();
const port = 3000;


app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Text-to-Speech MP3 Downloader</title>
    <link rel="icon" href="https://play-lh.googleusercontent.com/g_kL7h8URKWuZIA2Qvw6Q2jniVbOHRWqWVoC36LBrF-j_F_krqKdt1HtuxFz2vIgUQ" type="image/x-icon">
<script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body {
        overflow-x: hidden;
      }
    </style>
  </head>
  <body class="bg-gray-900 text-white flex flex-col items-center justify-center min-h-screen px-4">
    
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
      <h1 class="text-2xl font-bold mb-4">English Text-to-Speech MP3 Downloader</h1>

      <textarea id="text" rows="4" class="w-full p-2 text-black rounded" placeholder="Enter text here..."></textarea>

      <label class="block mt-2">Select Voice:</label>
      <select id="voice" class="w-full p-2 text-black rounded">
        <option value="en">Google US English</option>
        <option value="en-GB">Google UK English Male</option>
        <option value="hi">Google हिंदी (Hindi)</option>
        <option value="de">Google Deutsch (German)</option>
        <option value="es">Google español (Spanish)</option>
        <option value="fr">Google français (French)</option>
        <option value="it">Google italiano (Italian)</option>
        <option value="ja">Google 日本語 (Japanese)</option>
        <option value="ko">Google 한국어 (Korean)</option>
        <option value="ru">Google русский (Russian)</option>
        <option value="zh-CN">Google 普通话 (Chinese - Mainland)</option>
        <option value="kn">Google ಕನ್ನಡ (Kannada)</option>
        <option value="te">Google తెలుగు (Telugu)</option>
        <option value="ta">Google தமிழ் (Tamil)</option>
        <option value="ml">Google മലയാളം (Malayalam)</option>
      </select>

      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <button id="play-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Play</button>
        <button id="download-button" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Download MP3</button>
      </div>

      <audio id="audio-player" controls class="mt-4 w-full" style="display: none;"></audio>

      <div id="result" class="mt-2 text-sm"></div>
    </div>

    <p class="mt-6 text-sm text-gray-400">
    Designed & Developed By 
    <a href="https://github.com/yashu1wwww" class="text-blue-400 hover:underline" target="_blank">Yashwanth R</a>
  </p>
  

    <script>
      document.getElementById("play-button").addEventListener("click", async () => {
        const text = document.getElementById("text").value.trim();
        const voice = document.getElementById("voice").value;
        if (!text) return alert("Please enter some text.");
        
        try {
          const response = await fetch(\`/synthesize?text=\${encodeURIComponent(text)}&voice=\${voice}\`);
          if (response.ok) {
            const audioUrl = URL.createObjectURL(await response.blob());
            const audioPlayer = document.getElementById("audio-player");
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = "block"; // Ensure visibility on mobile
            audioPlayer.play();
          } else {
            alert("Failed to generate speech preview.");
          }
        } catch (error) {
          console.error(error);
          alert("An error occurred while generating speech.");
        }
      });

      document.getElementById("download-button").addEventListener("click", async () => {
        const text = document.getElementById("text").value.trim();
        const voice = document.getElementById("voice").value;
        if (!text) return alert("Please enter some text.");
        
        document.getElementById("result").textContent = "Generating MP3 file...";
        
        try {
          const response = await fetch(\`/synthesize?text=\${encodeURIComponent(text)}&voice=\${voice}\`);
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "output.mp3";
            link.click();
            document.getElementById("result").textContent = "Download complete!";
          } else {
            document.getElementById("result").textContent = "Failed to generate speech.";
          }
        } catch (error) {
          console.error(error);
          document.getElementById("result").textContent = "An error occurred while processing the request.";
        }
      });
    </script>

  </body>
  </html>
  `);
});


app.get("/synthesize", async (req, res) => {
  const { text, voice } = req.query;
  if (!text) return res.status(400).send("Text query parameter is required");

  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: voice || "en",
      slow: false,
      host: "https://translate.google.com",
    });

    const audioStream = await fetch(url);
    if (!audioStream.ok) throw new Error("Failed to fetch audio stream");

    res.setHeader("Content-Type", "audio/mp3");
    res.setHeader("Content-Disposition", 'attachment; filename="output.mp3"');

    audioStream.body.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating the audio");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

