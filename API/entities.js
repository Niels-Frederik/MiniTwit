const { Sequelize, DataTypes } = require('sequelize');
// const config = require('./config.json');
const db = {};

// console.log(process.env)

let sequelize = 
  process.env.NODE_ENV == 'test' ?
	new Sequelize('sqlite::memory:', {logging: false}) :
    new Sequelize
    ({
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
            require: true,
            rejectUnauthorized: false
            }
        }
    })

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
// Users.belongsToMany(Users, {through: Followers, as: 'who'});
// Users.belongsToMany(Users, {through: Followers, as: 'whom'});
Followers.belongsTo(Users, {as: 'who', foreignKey: 'who_id'}); // When including, use 'as: "who"', to include the who User
Followers.belongsTo(Users, {as: 'whom', foreignKey: 'whom_id'}); // When including, use 'as: "whom"', to include the whom User

db.Users = Users;
db.Followers = Followers;
db.Messages = Messages;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

