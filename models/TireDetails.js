const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

const TireDetailsModel = sequelize.define(
  "TireDetails",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tire_size: { type: DataTypes.STRING(50), allowNull: false },
    tire_brand: { type: DataTypes.STRING(100), allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    warranty_distance: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "tiredetails",
    timestamps: false,
  }
);

class TireDetails {
  static async findAll() {
    return await TireDetailsModel.findAll({ raw: true });
  }

  static async findByTireSize(tireSize) {
    return await TireDetailsModel.findOne({
      where: { tire_size: tireSize },
      raw: true,
    });
  }

  static async create({ tire_size, tire_brand, total_price, warranty_distance }) {
    const tireDetail = await TireDetailsModel.create({
      tire_size,
      tire_brand,
      total_price,
      warranty_distance,
    });
    return tireDetail.get({ plain: true });
  }
}

module.exports = TireDetailsModel;
module.exports.TireDetailsModel = TireDetailsModel;
module.exports.TireDetails = TireDetails;
