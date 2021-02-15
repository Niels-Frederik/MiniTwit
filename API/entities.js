const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('../db-config.json');
const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

const Users = Sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    }
    
});































const Rooms = sequelize.define('rooms', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    setting_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Settings,
            key: 'id'
        }
    }
}, {
    timestamps: false
});
