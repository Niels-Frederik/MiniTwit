const assert = require('assert')
const db = require('./entities')
const repo = require('./repository')
//const api = require('./simulatorAPI')

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
	{author_id: 1, text: "hej hej", pub_date: 0, flagged: 0},
	{author_id: 1, text: "test",	pub_date: 0, flagged: 0},
	{author_id: 1, text: "test1", pub_date: 0, flagged: 0},
	{author_id: 1, text: "test2", pub_date: 0, flagged: 0},
	{author_id: 2, text: "hey hej", pub_date: 0, flagged: 0},
	{author_id: 2, text: "hej", pub_date: 0, flagged: 0}
  ]
  messages.forEach(async (message) => await db.Messages.create(message));

  const followers = [
	{who_id: 1, whom_id: 2},
	{who_id: 1, whom_id: 3},
	{who_id:3, whom_id: 1}
  ]
  followers.forEach(async (follower) =>  await db.Followers.create(follower));

}


describe('getUserId', async () => {
  it('user exists', async () => {
	const user = await repo.findByUsernameAsync('Martin');
	assert.notEqual(user, null)
  });
});
