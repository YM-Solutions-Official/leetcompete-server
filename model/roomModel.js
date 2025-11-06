import mongoose from 'mongoose';
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  status: { type: String, enum: ['waiting', 'active', 'started'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', RoomSchema);
export default Room;