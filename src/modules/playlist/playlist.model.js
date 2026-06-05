// src/modules/playlist/playlist.model.js
import { DataTypes } from 'sequelize'
import sequelize from '../../database/connection.js'

const Playlist = sequelize.define('Playlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  trackIds: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('trackIds')
      return val ? JSON.parse(val) : []
    },
    set(val) {
      this.setDataValue('trackIds', JSON.stringify(val))
    },
  },
}, {
  tableName: 'playlists',
  timestamps: true,
})

export default Playlist
