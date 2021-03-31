const assert = require('assert')
const db = require('./entities')
const repo = require('./repository')
const sequelize = require("sequelize");

before(async function() {
  await db.sequelize.sync({ force: true});
});

beforeEach(async function() {
  await initialize()
});

afterEach(async function() {
  await db.sequelize.sync({ force: true});
});

async function initialize() {
  const users = [
	{username: "Martin", email: "mmho@itu.dk", pw_hash: "Hej123!"},
	{username: "Hampus", email: "haiv@itu.dk", pw_hash: "Hej123!"},
	{username: "Niller",	email: "nieb@itu.dk", pw_hash: "Hej123!"},
	{username: "Test123", email: "test123@itu.dk", pw_hash: "Hej123!"}
  ]
  users.forEach(async (user) => await db.Users.create(user))

  const messages = [
	{author_id: 1, text: "hej hej", pub_date: 1, flagged: 0},
	{author_id: 1, text: "test",	pub_date: 2, flagged: 0},
	{author_id: 1, text: "test1", pub_date: 3, flagged: 0},
	{author_id: 1, text: "test2", pub_date: 4, flagged: 0},
	{author_id: 2, text: "hey hej", pub_date: 5, flagged: 0},
	{author_id: 2, text: "hej", pub_date: 6, flagged: 0}
  ]
  messages.forEach(async (message) => await db.Messages.create(message));

  const followers = [
	{who_id: 1, whom_id: 2},
	{who_id: 1, whom_id: 3},
	{who_id:3, whom_id: 1},
	{who_id:3, whom_id:2}
  ]
  followers.forEach(async (follower) =>  await db.Followers.create(follower));

}


describe('getUserId', async () => {
  it('user exists', async () => {
	const user = await repo.findByUsernameAsync('Martin');
	assert(user.user_id === 1);
  });
  it('user not exists', async () => {
	const user = await repo.findByUsernameAsync('Maaartin');
	assert(!user);
  });
});


describe('get timeline async', async () => {
	it('Martin returns 6 messages', async () => {
	  const result = await repo.getTimelineAsync(1, 100);
	  assert(result.messages.length === 6);
	});
	it('Hampus returns 2 messages', async () => {
		const result = await repo.getTimelineAsync(2, 100);
		assert(result.messages.length === 2);
	  });
	it('Niller returns 4 messages', async () => {
	const result = await repo.getTimelineAsync(3, 100);
	assert(result.messages.length === 6);
	});
});

describe('get public timeline async', async () => {
	it('per page set to 100 returns all 6 messages', async () => {
	  const result = await repo.getPublicTimelineAsync(100);
	  assert(result.messages.length === 6);
	});
	it('per page set to 2 returns latest 2 messages', async () => {
		const result = await repo.getPublicTimelineAsync(2);
		assert(result.messages.length === 2);
		assert(result.messages[0].pub_date === 6);
		assert(result.messages[1].pub_date === 5);
	  });
});

describe('follow user async', async () => {
	it('Hampus follow Martin', async () => {
	  const result = await repo.followUserAsync(2, 1);
	  assert(result.who_id === 2);
	  assert(result.whom_id === 1);
	  assert(result._options.isNewRecord === true);
	});
});

describe('unfollow user async', async () => {
	it('Martin unfollow Hampus', async () => {
	  const result = await repo.unfollowUserAsync(1, 2);
	  const follower = await db.Followers.findOne({where: {
		  who_id: 1,
		  whom_id:2
	  }});
	  assert(result === 1);
	  assert(!follower);
	});
});

describe('post message async', async () => {
	it('Niller post message returns 1 message', async () => {
		const text = "niller is cool";
		const userId = 3
		await repo.postMessageAsync(userId, text);
		const result = await db.Messages.findAll({
			where: {
				author_id: userId
			}
		});

		assert(result.length === 1);
		assert(result[0].text === text);
	});
});

describe('create user async', async () => {
	it('create new unique user', async () => {
		const username = "Bobafeet";
		const email = "bobafeet@gmail.com";
		const pwh = "ælakjsjdf98u3w4wradsf"
		await repo.createUserAsync(username, email, pwh);
		const user = await db.Users.findOne({
			where: {
				username: username
			}
		});

		assert(user.username === username);
		assert(user.email === email);
		assert(user.pw_hash === pwh);
	});
	it('create existing user returns undefined', async () => {
		const username = "Martin";
		const email = "mmho@itu.dk";
		const pwh = "ælakjsjdf98u3w4wradsf"
		const newUser = await repo.createUserAsync(username, email, pwh);
		const user = await db.Users.findOne({
			where: {
				username: username,
				email: email,
				pw_hash: pwh
			}
		});

		assert(!newUser);
		assert(!user);
	});
});

describe('get messages async', async () => {
	it('Get Martins messages async returns only his messages', async () => {
		const messages = await repo.getMessagesAsync(1);

		assert(messages.length === 4);
		assert(messages.some((msg)=> { return (msg.author_id === 1)}) === false);
	});
	it('Get messages of non existing user returns empty list', async () => {
		const messages = await repo.getMessagesAsync(0);
		assert(messages.length === 0);
	});
});

describe('getIsWhoFollowingWhomAsync', async () => {
	it('Martin is following Hampus', async () => {
	  const isFollowing = await repo.getIsWhoFollowingWhomAsync(1, 2);
	  assert(isFollowing)
	});
	it('Hampus is not following Martin', async () => {
	  const isFollowing = await repo.getIsWhoFollowingWhomAsync(2, 1);
	  assert(!isFollowing)
	});
});

describe('simulatorGetAllMessagesAsync', async () => {
	it('Returns all 6 messages', async () => {
	  const messages = await repo.simulatorGetAllMessagesAsync(100);
	  assert(messages.length, 6)
	});
	it('Returns all messages limited to 3', async() => {
	  const messages = await repo.simulatorGetAllMessagesAsync(3);
	  assert(messages.length, 3)
	});
});

describe('simulatorGetUserMessagesAsync', async() => {
	it('Get all Martins 4 messages', async() => {
	  const messages = await repo.simulatorGetUserMessagesAsync(1, 100)
	  assert(messages.length, 4)
	});
	it('Get 2 of Martins messages with limit on 2', async() => {
	  const messages = await repo.simulatorGetAllMessagesAsync(1, 2)
	  assert(messages.length, 2)
	});
	it("Get 0 messages from user who hasn't posted yet", async() => {
	  const messages = await repo.simulatorGetUserMessagesAsync(3, 100)
	  assert(messages.length==0)
	});
	it("Get 0 messages from user who doesn't exist", async() => {
	  const messages = await repo.simulatorGetUserMessagesAsync(50, 100)
	  assert(messages.length==0)
	});
});

describe('simulatorGetFollowersAsync', async() => {
	it('get all Hampus 2 followers', async() => {
	  const followers = await repo.simulatorGetFollowersAsync(2, 50)
	  assert(followers.length, 2)
	});
	it('get Hampus followers with limit on 1', async() => {
	  const followers = await repo.simulatorGetFollowersAsync(2, 1)
	  assert(followers.length, 1)
	});
	it('get followers of user without followers', async() => {
	  const followers = await repo.simulatorGetFollowersAsync(4, 50)
	  assert(followers.length==0)
	});
});
