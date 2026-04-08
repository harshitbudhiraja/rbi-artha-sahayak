import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/scrape", async (req, res) => {
    try {
      const url = "https://www.rbi.org.in/scripts/AnnualPublications.aspx?head=Handbook%20of%20Statistics%20on%20Indian%20Economy";
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      const pdfLinks: { title: string; url: string }[] = [];

      // RBI Handbook page structure: usually links are in a table or list
      // We look for links ending in .PDF or having PDF in text
      $("a").each((i, el) => {
        const href = $(el).attr("href");
        const title = $(el).text().trim();
        if (href && (href.toLowerCase().endsWith(".pdf") || title.toLowerCase().includes("pdf"))) {
          let fullUrl = href;
          if (!href.startsWith("http")) {
            fullUrl = "https://www.rbi.org.in/scripts/" + href;
          }
          pdfLinks.push({ title, url: fullUrl });
        }
      });

      // Filter unique links
      const uniqueLinks = Array.from(new Set(pdfLinks.map(l => l.url)))
        .map(url => pdfLinks.find(l => l.url === url)!);

      res.json({ links: uniqueLinks });
    } catch (error: any) {
      console.error("Scrape error:", error.message);
      res.status(500).json({ error: "Failed to scrape RBI website" });
    }
  });

  app.post("/api/download-zip", async (req, res) => {
    const { links } = req.body;
    if (!links || !Array.isArray(links)) {
      return res.status(400).json({ error: "Invalid links provided" });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=rbi_handbook_statistics.zip');

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      console.error("Archive error:", err);
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    for (const link of links) {
      try {
        const response = await axios.get(link.url, { responseType: 'arraybuffer' });
        const fileName = link.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".pdf";
        archive.append(Buffer.from(response.data), { name: fileName });
      } catch (err: any) {
        console.error(`Failed to download ${link.url}:`, err.message);
        // Continue with other files
      }
    }

    archive.finalize();
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages provided" });
      }

      const response = await axios.post(
        "https://api.sarvam.ai/v1/chat/completions",
        {
          model: "sarvam-m",
          messages,
          temperature: 0.2
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`
          }
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("Sarvam API error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch response from Sarvam AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
