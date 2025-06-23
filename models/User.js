const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  azure_id: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(255) },
  role: { type: DataTypes.STRING(50) }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;