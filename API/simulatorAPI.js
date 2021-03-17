const express = require("express");
const { Op } = require('sequelize');
const dotenv = require('dotenv').config();
const db = require('./entities');
const { Sequelize } = require('sequelize');
const url = require('url')
const prom = require('prom-client');

const app = express();
const port = 5001;

const register = new prom.Registry();
const Monitor = require('./monitoring')
const monitoring = new Monitor.Monitoring(prom, register)

app.use(express.json())
app.use(beforeMiddleware)

function beforeMiddleware(req, res, next) {
  const route = url.parse(req.url).pathname
  if(route !== '/metrics') monitoring.request_counter.inc();
  next()
}

function afterMiddleware(req, res, next) {
  const route = url.parse(req.url).pathname
  if(route !== '/metrics') {
	const response = res.statusCode.toString()
	if (response[0] =='1') monitoring.information_response_counter.inc()
	else if(response[0] == '2') monitoring.success_response_counter.inc()
	else if (response[0] == '3') monitoring.redirect_response_counter.inc()
	else if (response[0] == '4') monitoring.client_error_response_counter.inc()
	else if (response[0] == '5') monitoring.server_error_response_counter.inc()
  }
}

app.get('/metrics', async(req, res, next) =>
{
  res.setHeader('Content-Type', register.contentType)
  res.end(await register.metrics())
  next()
})

let LATEST = 0;

function notReqFromSimulator(req){
    const fromSimulator = req.header('Authorization');
    if(fromSimulator != "Basic c2ltdWxhdG9yOnN1cGVyX3NhZmUh") {
        const error = "You are not authorized to use this resource!";
        return [403, error]
    }
}

async function getUserId(username)
{
	const user = await db.Users.findOne({
		where: {
			username: username
		}
	});
	if (user) return user.user_id
	return null;
}

function updateLatest(request) {
    const q = request.query.latest;
    LATEST = q == null ? LATEST : q;
}


app.get('/latest', async (req, res, next) => {
    res.json({"latest": LATEST});
	next()
    return;
});


app.post('/register', async (req,res, next) => 
{
    updateLatest(req);

    const {username, email, pwd} = req.body;
    const userid = await getUserId(username);
    
    const requestData = req.json;
    let error;

    if(!username) error = "You have to enter a username";
    else if(!email) error = "You have to enter an email";
    else if(!pwd) error = "You have to enter a password";
    else if(userid != null) error = "The username is already taken";
    else{
        await db.Users.create({
            username: username,
            email: email,
            pw_hash: pwd
        });
    }

    if(error) {
		res.status(400).send(error)
		next()
        return;
    }
    else {
        res.sendStatus(204);
		next()
        return;
    }


});

app.get('/msgs', async (req, res, next) => {
    updateLatest(req);

    notFromSim = notReqFromSimulator(req);
    if (notFromSim) {
		res.status(notFromSim[0]).send(notFromSim[1])
		next()
        return;
    }
        
        
    
    let limit = req.query.no;
    if (!limit) limit = 100;
    const result = await db.Messages.findAll({
		include: [{
			model: db.Users, 
			attributes: []
		}],
		where: {
			flagged: 0
		},
		raw: true,
		order: [['pub_date', 'DESC']],
		attributes: ['user.username', 'text', 'pub_date'],
		limit: limit
	})
    
    let filteredMsgs = [];
    result.forEach((msg, i) => {
        filteredMsg = {};
        filteredMsg.content = msg.text;
        filteredMsg.pub_date = msg.pub_date;
        filteredMsg.user = msg.username;
        filteredMsgs.push(filteredMsg);
    });
    
    res.send(filteredMsgs); 
	next()
    return;   
});

app.get('/msgs/:username', async (req, res, next) => 
{
    updateLatest(req);

    notFromSim = notReqFromSimulator(req);
    if (notFromSim) {
	  res.status(notFromSim[0]).send(notFromSim[1])
	  next()
	  return;
	}

    const userid = await getUserId(req.params.username);
    if(!userid){ 
        res.sendStatus(404);
		next()
        return;
    }
    
    let limit = req.query.no;
    if (!limit) limit = 100;
    let result = null;
    result = await db.Messages.findAll({
        include: [{
            model: db.Users, 
            attributes: []
        }],
        where: {
            flagged: 0,
            author_Id: userid
        },
        raw: true,
        order: [['pub_date', 'DESC']],
        attributes: ['user.username', 'text', 'pub_date'],
        limit: limit
    });

    let filteredMsgs = [];
    result.forEach(msg => {
        filteredMsg = {};
        filteredMsg.content = msg.text;
        filteredMsg.pub_date = msg.pub_date;
        filteredMsg.user = msg.username;
        filteredMsgs.push(filteredMsg);
    });

    res.json(filteredMsgs);  
	next()
    return;  
    
});

app.post('/msgs/:username', async (req, res, next) => 
{
    updateLatest(req);
    console.log("Recieved a Post to /msgs/:username with username: " + req.params.username);

    notFromSim = notReqFromSimulator(req);
    if (notFromSim) {
		res.status(notFromSim[0]).send(notFromSim[1])
		next()
        return;
    } 

    const text = req.body.content;
    const userid = await getUserId(req.params.username);
    if (userid == null || text == '') {
        console.log("   - Post failed: " + (userid == null? "user does not exist" : "message is empty: " + text))
        res.sendStatus(400);
		next()
        return;
    } 
    else {
		const date = (Math.floor(Date.now()/1000))
		await db.Messages.create({
			author_id: userid,
			text: text,
			pub_date: date,
			flagged: 0
		})
        res.sendStatus(204);
		next()
        return;
    }
})

app.post('/fllws/:username', async(req, res, next) => {
    updateLatest(req);

    const notReqFromSim = notReqFromSimulator(req);

    if(notReqFromSim){
		res.status(notReqFromSim[0]).send(notReqFromSim[1])
		next()
        return;
    }

    const userId = await getUserId(req.params.username);
    console.log(req.params.username);
    console.log(userId);
    if (!userId) {
        res.sendStatus(404);
		next()
        return;
    }

    if (Object.keys(req.body).indexOf('follow') !== -1) { //if we should follow the given user
        const userToFollowId = await getUserId(req.body.follow);
        if (userToFollowId == null) {
			res.status(404).send("Invalid user to follow");
			next()
            return;
        }
        await db.Followers.create({
            who_id: userId,
            whom_id: userToFollowId
        });
        res.status(200).send("You are now following " + req.body.follow);
		next()
        return;
    }
    
    if (Object.keys(req.body).indexOf('unfollow') !== -1) { //if we should unfollow the given user
        const userToUnFollowId = await getUserId(req.body.unfollow);
        if (userToUnFollowId == null) {
            res.sendStatus(404, "Invalid user to unfollow");
			next()
            return
        }
        await db.Followers.destroy({
            where: {
                who_id: userId,
                whom_id: userToUnFollowId
            }
        });
        res.status(200).send("You have unfollowed " + req.body.unfollow);
		next()
        return;
    }
	next()
});

app.get('/fllws/:username', async(req, res, next) => {
    updateLatest(req);

    const notReqFromSim = notReqFromSimulator(req);

    if(notReqFromSim){
		res.status(notReqFromSim[0]).send(notReqFromSim[1])
		next()
        return;
    }

    const userId = await getUserId(req.params.username);

    if (!userId) {
        res.sendStatus(404);
		next()
        return;
    }

    let limit = req.query.no;
    if (limit == null) limit == 100;

    const result = await db.Followers.findAll({
		include: {
			model: db.Users,
            as: 'who',
            attributes: []
        },
        where: {
            whom_id: userId
        },
        attributes: ['who.username'],
        raw: true,
		limit: limit
	});


    let resultList = [];
    result.forEach((item, i) => {
        resultList.push(item['username']);
    });
    res.send({'followers': resultList});
	next()
    return;
}); 

app.use(afterMiddleware)

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
});
