// src/modules/genre/genre.model.js
import { DataTypes } from 'sequelize'
import sequelize from '../../database/connection.js'

const Genre = sequelize.define('Genre', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'genres',
  timestamps: true,
})

export default Genre
