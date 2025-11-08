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
      type: Number, // Stored in seconds
      required: true,
      default: 0
    },
    winner: {
      type: String, // Should store the User's ObjectId string
      default: null, // 'draw' can be a special case
    },
    // We can also store the winner as an ObjectId
    /*
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    isDraw: {
      type: Boolean,
      default: false
    }
    */
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;