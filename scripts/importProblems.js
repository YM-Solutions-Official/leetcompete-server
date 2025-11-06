import mongoose from 'mongoose';
import fs from 'fs';
import Problem from '../model/problemModel.js';
import dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGO_URI;

async function importProblems() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const data = JSON.parse(fs.readFileSync('./data/problems.json', 'utf8'));
        console.log(`📁 Found ${data.problems.length} problems`);
        await Problem.deleteMany({});
        console.log('🗑️  Cleared old problems');
        await Problem.insertMany(data.problems);
        console.log(`✅ Imported ${data.problems.length} problems`);

        const stats = await Problem.aggregate([
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]);
        
        console.log('\n📊 Problems by difficulty:');
        stats.forEach(s => console.log(`   ${s._id}: ${s.count}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

importProblems();
