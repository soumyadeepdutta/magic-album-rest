'use strict';
const { hash, verify } = require('#utils/password');
const jwt = require('jsonwebtoken');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    /**
     * Updates password
     * @param {String} password updated password text
     */
    async updatePassword(password) {
      this.password = await hash(password);
    }

    /**
     * Check if user entired password is valid
     * @param {string} password user entered password
     * @returns
     */
    async verifyPassword(password) {
      // implement other logics if required later
      return verify(password, this.password);
    }

    /**
     * Returs jwt token for authentication
     * @returns jwt token
     */
    generateAuthToken() {
      return jwt.sign(
        {
          email: this.email,
          id: this.id
          // roles: this.roles
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_TIME || '1d' }
      );
    }
  }
  users.init(
    {
      email: { type: DataTypes.STRING, unique: true },
      status: { type: DataTypes.INTEGER, defaultValue: 0 },
      password: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'users',
      hooks: {
        beforeCreate: async (record, options) => {
          record.dataValues.password = await hash(record.dataValues.password);
        }
      }
    }
  );
  return users;
};
