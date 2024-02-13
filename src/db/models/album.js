'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class album extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  album.init(
    {
      name: DataTypes.STRING,
      images: DataTypes.ARRAY(DataTypes.STRING),
      videos: DataTypes.ARRAY(DataTypes.STRING)
    },
    {
      sequelize,
      modelName: 'album'
    }
  );
  return album;
};
