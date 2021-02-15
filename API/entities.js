const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('../db-config.json');
const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

const Users = Sequelize.define('user', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pw_hash: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Followers = Sequelize.define('follower', {
    who_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'user_id'
        }
    },
    whom_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'user_id'
        }
    }
});

const Messages = Sequelize.define('message', {
	message_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	author_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	text: {
		type: DataTypes.STRING,
		allowNull: false
	},
	pub_date: {
		type: DataTypes.INTEGER
	},
	flagged: {
		type: DataTypes.INTEGER
	}
});
