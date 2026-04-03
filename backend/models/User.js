const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Astro' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNext: { type: Number, default: 1000 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  balance: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['invest', 'deposit', 'reward'] },
    amount: Number,
    date: { type: Date, default: Date.now },
    description: String
  }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
