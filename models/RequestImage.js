const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RequestImage = sequelize.define(
  "RequestImage",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requestId: { type: DataTypes.INTEGER, allowNull: false },
    imagePath: { type: DataTypes.STRING(255), allowNull: false },
    imageIndex: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "request_images",
    timestamps: false,
  }
);

module.exports = RequestImage;
