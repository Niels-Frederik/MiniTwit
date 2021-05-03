const express = require("express");
const bcrypt = require('bcrypt');
// const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookie_parser = require('cookie-parser')
const cors = require('cors')

const { Op } = require('sequelize');
const db = require('./entities');
const prom = require('prom-client');
const register = new prom.Registry();
const repo = require("./repository");

const app = express();
const port = 5000;
app.use(cookie_parser())
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(myMiddleware)

register.setDefaultLabels({
  app: 'minitwit'
})
prom.collectDefaultMetrics({ register })

const request_counter = new prom.Counter({
  name: 'minitwit_total_responses',
  help: 'metric_help',
  registers: [register],
});
register.registerMetric(request_counter)

//const AggregatorRegistry = prom.AggregatorRegistry
//AggregatorRegistry.setRegistries(register);


function myMiddleware(req, res, next) {
  request_counter.inc();
  //const count = await response_counter.get()
  //console.log('Det her er vores request counter: ' + JSON.stringify(count))
  next()
}

app.get('/metrics', async(req, res) =>
{
	res.setHeader('Content-Type', register.contentType)
	res.end(await register.metrics())
})

//Shows a users timeline or if no user is logged in it will
//redirect to the public timeline.  This timeline shows the user's
//messages as well as all the messages of followed users
app.get('/', async (req, res) => {

    const userId = await getUserIdFromJwtToken(req);
    if (userId == null) res.redirect("public_timeline")
    else res.redirect("timeline");
})

app.get('/timeline', async(req,res) =>
{
    const userId = await getUserIdFromJwtToken(req);
	if (userId == null) 
	{
		//res.send()
		res.redirect('public_timeline');
		return
	}
	const PER_PAGE = 30;
	const obj = await repo.getTimelineAsync(userId, PER_PAGE);
    res.send(obj)
})
  
//Displays the latest messages of all users
app.get('/public_timeline', async (req,res) =>
{
    const remoteAddress = req.socket.remoteAddress;
    const ip = remoteAddress.replace(/^.*:/, '');
    console.log("We got a visitor from: " + ip);

    const PER_PAGE = 30;
	const obj = await repo.getPublicTimelineAsync(PER_PAGE);
    res.send(obj);
})

app.post('/:username/follow', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req)
	if (userId == null) 
	{
		res.sendStatus(401)
		return
	}
	const whomId = await repo.getUserId(req.params.username);
	if (whomId == null) 
	{
		res.sendStatus(404)
		return
	}
	console.log(userId)
	await repo.followUserAsync(userId, whomId);
    res.status(200).send("You are now following " + req.params.username)
	//res.redirect()
})

app.delete('/:username/unfollow', async (req,res) =>
{
	const userId = await getUserIdFromJwtToken(req)
	if (userId == null)
	{
		res.sendStatus(401)
		return
	}
	const whomId = await repo.getUserId(req.params.username)
	if (whomId == null) 
	{
		res.sendStatus(404)
		return
	}
	await repo.unfollowUserAsync(userId, whomId);
	res.status(200).send("You are no longer following " + req.params.username)
	//res.redirect()
})

app.post('/add_message', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req);
    const text = req.body.text;
    if (userId == null || text == '' || text == null) {
        res.sendStatus(400);
        return;
    } else {
		await repo.postMessageAsync(userId, text);
        res.sendStatus(200)
    }
})

app.post('/login', async (req,res) =>
{
    const username = req.body.username
    const password = req.body.password

    if (!(username && password)) res.sendStatus(400)

	// exists in repo findByUsernameAsync
	const row = await repo.findByUsernameAsync(username)

    if (!row) 
    {
        res.status(400).send("Incorrent username or password")
        return
    }

    try
    {
        await bcrypt.compare(password, row.pw_hash, function(err, row)
        {
            if (row)
            {
                const user = {username: username}
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

                let options = {
                    httpOnly: false, // The cookie only accessible by the web server
					signed: false, // Indicates if the cookie should be signed
                    //secure: true
					//domain: process.env.NODE_ENV === "development" ? null : "http://161.35.214.217"
					//domain: ""
                }

                res.cookie('accessToken', accessToken, options)
                res.sendStatus(200)
            } else res.status(400).send("Incorrect username or password")
        })
    }
    catch
    {
        res.status(400).send("Incorrect username or password")
    }
})

app.post('/register', async (req,res) =>
{
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    //Check if all parameters are given
    if (!(username && email && password)) res.sendStatus(400)

	const userid = await repo.getUserId(username)
    
    //A user already exists
    if (userid)
    {
        res.status(400).send("A user with that username already exists")
    }
    else
    {
        try
        {
            const pw_hash = await bcrypt.hash(req.body.password, 10)
			await repo.createUserAsync(username, email, pw_hash);
            res.sendStatus(200)
        }
        catch 
        {
            res.sendStatus(500)
        }
    }
})
    
app.get('/logout', (req,res) =>
{
	res.clearCookie('accessToken')
	res.redirect('/public_timeline');
	return
})

app.get('/:username', async (req,res) =>
{
	// replace with repo getUserId
    const whomId = await repo.getUserId(req.params.username)
	const userId = await getUserIdFromJwtToken(req)

    if (whomId == null) 
    {
        res.sendStatus(400)
        return
    }

	const messages = await repo.getMessagesAsync(whomId)

    if (messages) {

		var m = []

		const followed = await repo.getIsWhoFollowingWhomAsync(userId, whomId);

		var followedOptions = 0
		if (whomId == userId) followedOptions = 0
		else if (followed) followedOptions = 1
		else followedOptions = 2

		messages.forEach(element => 
		{
			m.push(
			{
				"username": req.params.username,
				"text": element.dataValues.text,
				"pub_date" : element.dataValues.pub_date,
			})
		})
		const obj = 
		{
			"messages":m,
			"followedOptions": followedOptions
		}

        res.json(obj).send;
    } else {
        res.sendStatus(400);
        return
    }
})

async function getUserIdFromJwtToken(req)
{
	const token = req.cookies.accessToken
    if (token == null || token == undefined) return null

    try 
    {
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		return await repo.getUserId(verifiedToken.username)
    }
    catch
    {
        return null;
    }
}

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
