const assert = require('assert')
const db = require('./entities')
//const api = require('./simulatorAPI')

beforeEach(async function() {
  //await db.clear();
  //await db.save([tobi, loki, jane]);
});

describe('tests', () => {
  it('should return 2', () => {
	assert.equal(1+1, 2)
  });
  it('this is nr 2', () => {
	assert.equal(2+2, 4)
  });
});


describe('some other tests', () => {
  it('askadj', () =>{
	assert.equal(8*8, 64)
  });
});

/*
describe('register test', () => {
  it('register', () => {
	user = api.getUserId('Martin')
	assert.notEqual(user, null)
  });
});
*/

describe('getUserId', async () => {
  it('user exists', async () => {
	const user = await db.Users.findOne({
	  where: {
		username: 'Martin',
	  }
	});

	assert.notEqual(user, null)
  });
});
