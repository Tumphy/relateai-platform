import mongoose from 'mongoose';

export interface IMeddppicc extends mongoose.Document {
  account: mongoose.Types.ObjectId;
  metrics: {
    score: number;
    notes: string;
    confidence: string;
  };
  economicBuyer: {
    score: number;
    notes: string;
    confidence: string;
  };
  decisionCriteria: {
    score: number;
    notes: string;
    confidence: string;
  };
  decisionProcess: {
    score: number;
    notes: string;
    confidence: string;
  };
  paperProcess: {
    score: number;
    notes: string;
    confidence: string;
  };
  identifiedPain: {
    score: number;
    notes: string;
    confidence: string;
  };
  champion: {
    score: number;
    notes: string;
    confidence: string;
  };
  competition: {
    score: number;
    notes: string;
    confidence: string;
  };
  overallScore: number;
  dealHealth: string;
  nextSteps: Array<{
    text: string;
    completed: boolean;
    dueDate: Date;
  }>;
  dealNotes: string;
  lastUpdatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeddppiccSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    metrics: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    economicBuyer: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    decisionCriteria: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    decisionProcess: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    paperProcess: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    identifiedPain: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    champion: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    competition: {
      score: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      notes: {
        type: String,
        default: '',
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    dealHealth: {
      type: String,
      enum: ['High Risk', 'Moderate Risk', 'Healthy'],
      default: 'High Risk',
    },
    nextSteps: [
      {
        text: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        dueDate: {
          type: Date,
          required: true,
        },
      },
    ],
    dealNotes: {
      type: String,
      default: '',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate overall score and deal health before saving
MeddppiccSchema.pre('save', function (this: IMeddppicc, next) {
  // Calculate overall score
  const scores = [
    this.metrics.score,
    this.economicBuyer.score,
    this.decisionCriteria.score,
    this.decisionProcess.score,
    this.paperProcess.score,
    this.identifiedPain.score,
    this.champion.score,
    this.competition.score,
  ];
  
  this.overallScore = scores.reduce((sum, score) => sum + score, 0) / 8;
  
  // Set deal health based on overall score
  if (this.overallScore >= 2.5) {
    this.dealHealth = 'Healthy';
  } else if (this.overallScore >= 1.5) {
    this.dealHealth = 'Moderate Risk';
  } else {
    this.dealHealth = 'High Risk';
  }
  
  next();
});

const Meddppicc = mongoose.model<IMeddppicc>('Meddppicc', MeddppiccSchema);

export default Meddppicc;