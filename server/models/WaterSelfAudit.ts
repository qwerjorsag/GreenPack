import mongoose from "mongoose";

const WaterSelfAuditSchema = new mongoose.Schema(
  {
    profile: { type: String, required: true },
    language: { type: String, default: "cs" },
    answers: { type: Map, of: Number, default: {} },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WaterSelfAuditModel =
  mongoose.models.WaterSelfAudit ||
  mongoose.model("WaterSelfAudit", WaterSelfAuditSchema, "waterselfaudit");
