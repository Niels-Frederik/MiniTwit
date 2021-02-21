const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./config.json');
const db = {};

const sequelize = new Sequelize({
    dialect: config.database.development.dialect,
    storage: config.database.development.storage,
    quoteIdentifiers: config.database.development.quoteIdentifiers
    }
);

const Users = sequelize.define('user', {
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
},
{
	timestamps: false,
	freezeTableName: true,
	tableName: 'user'
});

const Followers = sequelize.define('follower', {
    who_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Users,
            key: 'user_id'
        },
			primaryKey: true
    },
    whom_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Users,
            key: 'user_id'
        },
			primaryKey: true
    }
},
{
	timestamps: false,
	freezeTableName: true,
	tableName: 'follower'
});

const Messages = sequelize.define('message', {
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
},
{
	timestamps: false,
	freezeTableName: true,
	tableName: 'message'

});

Messages.belongsTo(Users, {foreignKey: 'author_id'});
Users.belongsToMany(Users, {through: Followers, as: 'who'});
Users.belongsToMany(Users, {through: Followers, as: 'whom'});

db.Users = Users;
db.Followers = Followers;
db.Messages = Messages;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

