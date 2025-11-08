import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['cpp', 'javascript', 'python3', 'java']
    },
    status: {
        type: String,
        required: true,
        enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Syntax Error', 'Time Limit Exceeded']
    },
    results: {
        type: mongoose.Schema.Types.Mixed, // Store the complete evaluation result
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for efficient querying of submissions in a match
submissionSchema.index({ matchId: 1, userId: 1, problemId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;