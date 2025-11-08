import mongoose from 'mongoose';

const problemProgressSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    status: {
        type: String,
        enum: ['not_attempted', 'attempted', 'solved'],
        default: 'not_attempted'
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastSubmissionTime: Date,
    bestScore: {
        type: Number,
        default: 0
    }
});

const matchParticipantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    problems: [problemProgressSchema],
    totalScore: {
        type: Number,
        default: 0
    },
    totalTime: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['joined', 'ready', 'active', 'completed', 'disconnected'],
        default: 'joined'
    },
    rank: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Index for efficient querying
matchParticipantSchema.index({ matchId: 1, userId: 1 }, { unique: true });

const MatchParticipant = mongoose.model('MatchParticipant', matchParticipantSchema);

export default MatchParticipant;