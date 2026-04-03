const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id });
  res.json(goals);
};

const createGoal = async (req, res) => {
  const { name, target, color } = req.body;

  const goal = await Goal.create({
    userId: req.user._id,
    name,
    target,
    color,
  });

  if (goal) {
    res.status(201).json(goal);
  } else {
    res.status(400).json({ message: 'Invalid goal data' });
  }
};

const updateGoalProgress = async (req, res) => {
  const { goalId, amount } = req.body;
  
  const goal = await Goal.findById(goalId);

  if (goal) {
    goal.current += amount;
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404).json({ message: 'Goal not found' });
  }
};

module.exports = { getGoals, createGoal, updateGoalProgress };
