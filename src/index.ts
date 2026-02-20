// import express from "express";
import { MicService } from './services/micServices';
// import picoRoutes from "./routes/pico.routes";
// import { Logger } from "./utils/Logger";

// const micService = new MicService();

// process.on('SIGINT', () => {
//   micService.stopMonitoring();
//   process.exit();
// });

// micService.startMonitoring();

// const app = express();

// app.use(express.json());
// app.use("/api", picoRoutes);

// const PORT = 3000;

// app.listen(PORT, () => {
//   Logger.info(`🌐 API running on port ${PORT}`);
// })

import express from "express";
import cors from "cors";
import picoRoutes from "./routes/pico.routes";
import { Logger } from "./utils/Logger";
// import { MicService } from "./services/micServices"; // opcional

const app = express();

// 👉 Middlewares
app.use(cors());
app.use(express.json());

// 👉 Rotas
app.use("/api", picoRoutes);

// 👉 Health check (boa prática)
app.get("/", (_, res) => {
  res.send("SonoGuard API running");
});

const PORT = 3000;

app.listen(PORT, () => {
  Logger.info(`🌐 API running on port ${PORT}`);
});


const micService = new MicService();
 process.on("SIGINT", () => {
   micService.stopMonitoring();
   process.exit();
 });
 micService.startMonitoring();

