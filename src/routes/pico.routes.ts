// import { Router } from "express";
// import { Logger } from "../utils/Logger";

// const router = Router();

// router.post("/pico-alert", async (req, res) => {
//   console.log("BODY RECEBIDO:", req.body);

//   try {
//     const { sampleRate, device, samples } = req.body;

//     Logger.warn(
//       `🚨 Alert from Pico ${device || "unknown"}: ${sampleRate}`
//     );

//     res.json({ ok: true });

//   } catch (err) {
//     Logger.error("Error receiving Pico alert", err);
//     res.status(500).json({ error: "internal error" });
//   }
// });

// export default router;

// import { Router } from "express";
// import { Logger } from "../utils/Logger";
// import { PicoAudioService } from "../services/picoAudioService";

// const router = Router();
// const audioService = new PicoAudioService();

// router.post("/pico-alert", async (req, res) => {
//   try {
//     const { sampleRate, device, samples } = req.body;

//     Logger.warn(`🚨 Alert from Pico ${device}`);

//     const spectrum = await audioService.processSamples(
//       samples,
//       sampleRate,
//       device
//     );

//     res.json({ ok: true, spectrum });

//   } catch (err) {
//     Logger.error("Error receiving Pico alert", err);
//     res.status(500).json({ error: "internal error" });
//   }
// });

// export default router;

import { Router } from "express";
import multer from "multer";
import path from "path";
import { Logger } from "../utils/Logger";
import { PicoAudioService } from "../services/picoAudioService";

const router = Router();
const audioService = new PicoAudioService();

// pasta temporária upload
const upload = multer({
  dest: path.join("recordings"),
});

// router.post(
//   "/pico-alert",
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       const device = req.body.device || "pico";

//       if (!req.file) {
//         return res.status(400).json({
//           error: "No WAV file received",
//         });
//       }

//       Logger.warn(`🚨 WAV recebido do Pico: ${device}`);

//       const spectrum = await audioService.processWav(
//         req.file.path,
//         device
//       );

//       res.json({ ok: true, spectrum });

//     } catch (err) {
//       Logger.error("Error receiving WAV", err);
//       res.status(500).json({ error: "internal error" });
//     }
//   }
// );

import fs from "fs";
import express from "express";

router.get("/recordings/:file", (req, res) => {
  try {
    const fileName = req.params.file;

    // evita path traversal (segurança básica)
    if (fileName.includes("..")) {
      return res.status(400).send("Invalid filename");
    }

    const filePath = path.resolve("recordings", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading file");
  }
});

router.post(
  "/pico-alert",

  // Primeiro tenta interpretar como RAW WAV
  express.raw({ type: "audio/wav", limit: "10mb" }),

  async (req, res, next) => {
    // Se for multipart, passa para o multer
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      return next();
    }

    if (req.headers["content-type"] === "audio/wav") {
      try {
        const device: any =
          req.headers["x-device-id"] || req.query.device || "unknown-device";

        const filePath = `recordings/${device}_${Date.now()}.wav`;

        fs.writeFileSync(filePath, req.body);

        Logger.warn(`🚨 WAV recebido do device: ${device}`);

        const spectrum = await audioService.processWav(filePath, device);

        return res.json({ ok: true, device, spectrum });
      } catch (err) {
        Logger.error("Error receiving RAW WAV", err);
        return res.status(500).json({ error: "internal error" });
      }
    }

    next();
  },

  // Se não for RAW, tenta como multipart (Postman/browser)
  upload.single("file"),

  async (req, res) => {
    try {
      const device = req.body.device || "pico";

      if (!req.file) {
        return res.status(400).json({
          error: "No WAV file received",
        });
      }

      Logger.warn(`🚨 Multipart WAV recebido do Pico: ${device}`);

      const spectrum = await audioService.processWav(req.file.path, device);

      res.json({ ok: true, spectrum });
    } catch (err) {
      Logger.error("Error receiving WAV", err);
      res.status(500).json({ error: "internal error" });
    }
  },
);

export default router;
