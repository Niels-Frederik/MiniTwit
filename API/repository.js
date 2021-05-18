const db = require('./entities');
const { Op } = require('sequelize');

async function getTimelineAsync(userId, per_page) {

  const followedId = await db.Followers.findAll({
		where: {
			who_id: userId
		},
		raw: true,
		attributes:  ['whom_id']
	}).then(e => e.map(v => v.whom_id));

	const result = await db.Messages.findAll({
		include: [{
			model: db.Users,
			attributes: []
		}],
		where: {
			[Op.and]: [
				{ flagged: 0 }, 
				{ [Op.or]: [ 
					{ '$user.user_id$': userId, },
					{ '$user.user_id$': followedId} 
				]},
			]
		},
		raw: true,
		order: [['message_id', 'DESC']],
		attributes: ['user.username', 'text', 'pub_date'],
		limit: per_page
	})
	return {"messages": result, "followedOptions": -1};
}

async function getPublicTimelineAsync(per_page) {
    const result = await db.Messages.findAll({
		include: [{
			model: db.Users, 
			attributes: []
		}],
		where: {
			flagged: 0
		},
		raw: true,
		order: [['message_id', 'DESC']],
		attributes: ['user.username', 'text', 'pub_date'],
		limit: per_page
	});
	return {"messages": result, "followedOptions": -1};
}

async function followUserAsync(whoId, whomId) {
    return await db.Followers.create({
		who_id: whoId,
		whom_id: whomId
	});
}

async function unfollowUserAsync(whoId, whomId) {
    return await db.Followers.destroy({
		where: {
			who_id: whoId,
			whom_id: whomId
		}
	});
}

async function postMessageAsync(userId, text) {
    const date = (Math.floor(Date.now()/1000))
		await db.Messages.create({
			author_id: userId,
			text: text,
			pub_date: date,
			flagged: 0
		})
}

async function findByUsernameAsync(username) {
    return await db.Users.findOne({
		where: {
			username: username
		}
	});
}

async function getUserIdAsync(username) {
	const user = await findByUsernameAsync(username)
	if (user) return user.user_id
	return null
}

async function createUserAsync(username, email, pwhash) {
    const existingUser = await db.Users.findOne({
        where: {
            email: email
        }
    });
    if (existingUser) {
        return undefined;
    }
    return await db.Users.create({
        username: username,
        email: email,
        pw_hash: pwhash
    });
}

async function getMessagesAsync(userId) {
    return await db.Messages.findAll({
		where: {
			author_id: userId
		},
		attributes: ["text", "pub_date"]
	});
}

async function getIsWhoFollowingWhomAsync(whoId, whomId) {
    const follower = await db.Followers.findOne({
        where: {
            who_id: whoId,
            whom_id: whomId 
        },
        raw: true,
        attributes:  ['whom_id']
    });

    if (follower) {
        return true;
    }
    return false;
}

async function simulatorGetAllMessagesAsync(limit) {
    return await db.Messages.findAll({
        include: [
          {
            model: db.Users,
            attributes: [],
          },
        ],
        where: {
          flagged: 0,
        },
        raw: true,
        order: [["message_id", "DESC"]],
        attributes: ["user.username", "text", "pub_date"],
        limit: limit,
      });
}

async function simulatorGetUserMessagesAsync(userId, limit) {
    return await db.Messages.findAll({
        include: [
          {
            model: db.Users,
            attributes: [],
          },
        ],
        where: {
          flagged: 0,
          author_Id: userId,
        },
        raw: true,
        order: [["message_id", "DESC"]],
        attributes: ["user.username", "text", "pub_date"],
        limit: limit,
      });
}

async function simulatorGetFollowersAsync(userId, limit) {
    return await db.Followers.findAll({
        include: {
          model: db.Users,
          as: "who",
          attributes: [],
        },
        where: {
          whom_id: userId,
        },
        attributes: ["who.username"],
        raw: true,
        limit: limit,
      });
}

async function registerUserAsync(username, email, pwd) {
	const userid = await findByUsernameAsync(username);
	let error;
	  
	if (!username) error = "You have to enter a username";
	else if (!email) error = "You have to enter an email";
	else if (!pwd) error = "You have to enter a password";
	else if (userid != null) error = "The username is already taken";
	else 
	{
	  await createUserAsync(username, email, pwd)
	}
	return error
}

module.exports = {
    getTimelineAsync,
    getPublicTimelineAsync,
    followUserAsync,
    unfollowUserAsync,
    postMessageAsync,
    findByUsernameAsync,
	  getUserIdAsync,
    createUserAsync,
    getMessagesAsync,
	  registerUserAsync,
    getIsWhoFollowingWhomAsync,
    simulatorGetAllMessagesAsync,
    simulatorGetFollowersAsync,
    simulatorGetUserMessagesAsync
}
