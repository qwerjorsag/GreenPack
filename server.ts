import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import path from "path";
import fs from "fs";

import { SubmissionSchema } from "./src/shared/schemas";
import { computeSustainabilityKPIs, METHODOLOGY_VERSION } from "./src/shared/ruleset";
import { SubmissionModel } from "./server/models/Submission";
import { ElectricityModel } from "./server/models/Electricity";
import { ElectricitySelfAuditModel } from "./server/models/ElectricitySelfAudit";
import { WaterSelfAuditModel } from "./server/models/WaterSelfAudit";
import { WasteSelfAuditModel } from "./server/models/WasteSelfAudit";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const generatePDF = async (data: any) => {
  const filename = `report_${data.submissionId}.pdf`;
  const reportsDir = path.join(process.cwd(), "reports");
  const filePath = path.join(reportsDir, filename);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;

  const lang = data.language === "cs" ? "cs" : "en";
  const labels = {
    en: {
      title: "GreenPack Sustainability Report",
      id: "Submission ID",
      date: "Date",
      version: "Methodology Version",
      acc: "Accommodation",
      type: "Type",
      kpis: "Computed KPIs",
      rating: "Overall Rating",
      energy: "Energy per Guest",
      water: "Water per Guest",
      waste: "Waste Recycling Rate",
      recs: "Recommendations",
    },
    cs: {
      title: "GreenPack Zpráva o udržitelnosti",
      id: "ID podání",
      date: "Datum",
      version: "Verze metodiky",
      acc: "Ubytování",
      type: "Typ",
      kpis: "Vypočtené KPI",
      rating: "Celkové hodnocení",
      energy: "Energie na hosta",
      water: "Voda na hosta",
      waste: "Míra recyklace odpadu",
      recs: "Doporučení",
    },
  }[lang];

  page.drawText(labels.title, {
    x: 50,
    y: height - 50,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0.5, 0.2),
  });

  const lines = [
    `${labels.id}: ${data.submissionId}`,
    `${labels.date}: ${new Date().toLocaleString(lang === "cs" ? "cs-CZ" : "en-US")}`,
    `${labels.version}: ${METHODOLOGY_VERSION}`,
    `${labels.acc}: ${data.details.name}`,
    `${labels.type}: ${data.type}`,
    "",
    `${labels.kpis}:`,
    `- ${labels.rating}: ${data.computed.overallRating}`,
    `- ${labels.energy}: ${data.computed.energyPerGuest} kWh`,
    `- ${labels.water}: ${data.computed.waterPerGuest} m3`,
    `- ${labels.waste}: ${data.computed.wasteRecyclingRate}%`,
    "",
    `${labels.recs}:`,
    ...data.computed.recommendations.map((rec: string) => `- ${rec}`),
  ];

  let yOffset = height - 100;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: yOffset,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    yOffset -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecostay";
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite dev
  }));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many submissions from this IP, please try again later.",
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: mongoose.connection.readyState === 1 });
  });

  const ALLOWED_TOKENS = (process.env.ALLOWED_SOURCE_TOKENS || "H7K2-ABC,TEST-TOKEN").split(",");

  app.post("/api/submit", limiter, async (req, res) => {
    try {
      const validatedData = SubmissionSchema.parse(req.body);

      // Validate Source Token
      if (!ALLOWED_TOKENS.includes(validatedData.sourceToken)) {
        return res.status(403).json({ error: "Invalid source token" });
      }

      // Compute KPIs
      const computed = computeSustainabilityKPIs(validatedData);
      const submissionId = uuidv4();
      const ipHash = crypto.createHash("sha256").update(req.ip || "").digest("hex");

      // Generate PDF
      const pdfPath = await generatePDF({ ...validatedData, computed, submissionId });

      // Store in DB
      const submission = new SubmissionModel({
        submissionId,
        sourceToken: validatedData.sourceToken,
        language: validatedData.language,
        raw: validatedData,
        computed,
        methodologyVersion: METHODOLOGY_VERSION,
        ipHash,
        userAgent: req.headers["user-agent"],
        pdfPath,
        status: "completed",
      });

      await submission.save();

      res.json({
        submissionId,
        computed,
        pdfUrl: `/api/report/${submissionId}`,
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      res.status(400).json({ error: err.message || "Invalid submission data" });
    }
  });

  app.post("/api/electricity", limiter, async (req, res) => {
    try {
      const { profile, operationalData, energyByPeriod } = req.body || {};
      const profileSafe = profile ?? "unknown";

      const normalizePeriod = (p: any, index: number) => ({
        id: p?.id || `p${index + 1}`,
        period: p?.period ?? "",
        occupancyRate: p?.occupancyRate ?? null,
        operatingDays: p?.operatingDays ?? null,
        rooms: p?.rooms ?? null,
        floorArea: p?.floorArea ?? null,
      });

      let normalizedPeriods: any = null;
      if (Array.isArray(operationalData)) {
        normalizedPeriods = {
          year1: normalizePeriod(operationalData[0], 0),
          year2: normalizePeriod(operationalData[1], 1),
          year3: normalizePeriod(operationalData[2], 2),
        };
      } else if (operationalData && typeof operationalData === "object") {
        normalizedPeriods = {
          year1: normalizePeriod(operationalData.year1, 0),
          year2: normalizePeriod(operationalData.year2, 1),
          year3: normalizePeriod(operationalData.year3, 2),
        };
      } else {
        normalizedPeriods = {
          year1: normalizePeriod(null, 0),
          year2: normalizePeriod(null, 1),
          year3: normalizePeriod(null, 2),
        };
      }

      const normalizedEnergyByPeriod =
        energyByPeriod && typeof energyByPeriod === "object"
          ? energyByPeriod
          : { year1: {}, year2: {}, year3: {} };

      const doc = new ElectricityModel({
        profile: profileSafe,
        operationalData: normalizedPeriods,
        energyByPeriod: normalizedEnergyByPeriod,
      });
      await doc.save();

      res.json({ status: "ok", id: doc._id });
    } catch (err: any) {
      console.error("Electricity submission error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  app.post("/api/electricityselfaudit", limiter, async (req, res) => {
    try {
      const { profile, answers, language, totalScore } = req.body || {};
      const doc = new ElectricitySelfAuditModel({
        profile: profile ?? "unknown",
        language: language === "en" ? "en" : "cs",
        answers: answers && typeof answers === "object" ? answers : {},
        totalScore: typeof totalScore === "number" ? totalScore : 0,
      });
      await doc.save();
      res.json({ status: "ok", id: doc._id });
    } catch (err) {
      console.error("Electricity self-audit submission error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/waterselfaudit", limiter, async (req, res) => {
    try {
      const { profile, answers, language, totalScore } = req.body || {};
      const doc = new WaterSelfAuditModel({
        profile: profile ?? "unknown",
        language: language === "en" ? "en" : "cs",
        answers: answers && typeof answers === "object" ? answers : {},
        totalScore: typeof totalScore === "number" ? totalScore : 0,
      });
      await doc.save();
      res.json({ status: "ok", id: doc._id });
    } catch (err) {
      console.error("Water self-audit submission error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/wasteselfaudit", limiter, async (req, res) => {
    try {
      const { profile, answers, language, totalScore } = req.body || {};
      const doc = new WasteSelfAuditModel({
        profile: profile ?? "unknown",
        language: language === "en" ? "en" : "cs",
        answers: answers && typeof answers === "object" ? answers : {},
        totalScore: typeof totalScore === "number" ? totalScore : 0,
      });
      await doc.save();
      res.json({ status: "ok", id: doc._id });
    } catch (err) {
      console.error("Waste self-audit submission error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/report/:submissionId", async (req, res) => {
    try {
      const submission = await SubmissionModel.findOne({ submissionId: req.params.submissionId });
      if (!submission || !submission.pdfPath) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (fs.existsSync(submission.pdfPath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=GreenPack_Report_${submission.submissionId}.pdf`);
        fs.createReadStream(submission.pdfPath).pipe(res);
      } else {
        res.status(404).json({ error: "PDF file missing on server" });
      }
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
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
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
