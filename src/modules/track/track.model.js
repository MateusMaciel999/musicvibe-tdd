// src/modules/track/track.model.js
import { DataTypes } from 'sequelize'
import sequelize from '../../database/connection.js'

const Track = sequelize.define('Track', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  artist: { type: DataTypes.STRING, allowNull: false },
  album: { type: DataTypes.STRING, allowNull: true },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
  genreId: { type: DataTypes.INTEGER, allowNull: true },
  plays: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'tracks',
  timestamps: true,
})

export default Track
