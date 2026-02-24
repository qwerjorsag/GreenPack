import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true, index: true },
  sourceToken: { type: String, required: true, index: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  raw: { type: Object, required: true },
  computed: { type: Object, required: true },
  methodologyVersion: { type: String, required: true },
  ipHash: { type: String, required: true },
  userAgent: { type: String },
  pdfPath: { type: String },
  status: { type: String, enum: ['completed', 'error'], default: 'completed' }
});

// Compound index for source token and date as requested
SubmissionSchema.index({ sourceToken: 1, createdAt: -1 });

export const SubmissionModel = mongoose.model('Submission', SubmissionSchema);
