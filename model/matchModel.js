import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
      },
    ],
    scoreHost: {
      type: Number,
      default: 0,
    },
    scoreChallenger: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    winner: {
      type: String,
      enum: ["host", "challenger", "draw"],
      default: null,
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
