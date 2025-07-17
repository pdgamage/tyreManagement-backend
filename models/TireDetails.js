const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

const TireDetails = sequelize.define(
  "TireDetails",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    tire_size: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      unique: true
    },
    tire_brand: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    total_price: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    warranty_distance: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
  },
  {
    tableName: "tiredetails",
    timestamps: false,
  }
);

module.exports = TireDetails;
