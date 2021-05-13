const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookie_parser = require('cookie-parser')
const cors = require('cors')
const repository = require('./repository')
const prom = require('prom-client');
const {logger, errorLogger, customLogger} = require('./logger.js'); // for transports.Console

const register = new prom.Registry();

const app = express();
const port = 5000;
const router = express.Router();

app.use(cookie_parser())
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(myMiddleware)
app.use(logger);
app.use(router);

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

function myMiddleware(req, res, next) {
  request_counter.inc();
  next()
}

router.get('/metrics', async(req, res) =>
{
	res.setHeader('Content-Type', register.contentType)
	res.end(await register.metrics())
})

//Shows a users timeline or if no user is logged in it will
//redirect to the public timeline.  This timeline shows the user's
//messages as well as all the messages of followed users
router.get('/', async (req, res) => {

    const userId = await getUserIdFromJwtToken(req);
    if (userId == null) res.redirect("public_timeline")
    else res.redirect("timeline");
})

router.get('/timeline', async(req,res) =>
{
    const userId = await getUserIdFromJwtToken(req);
	if (userId == null) 
	{
		res.redirect('public_timeline');
		return
	}

	const result = await repository.getTimelineAsync(userId, 30)
	res.send(result)
})
  
//Displays the latest messages of all users
router.get('/public_timeline', async (req,res) =>
{
	const result = await repository.getPublicTimelineAsync(30)
    res.send(result);
})

//Displays a users tweets
router.post('/:username/follow', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req)
	if (userId == null) 
	{
		res.sendStatus(401)
		return
	}
	const whomId = await repository.getUserIdAsync(req.params.username)
	if (whomId == null) 
	{
		res.sendStatus(404)
		return
	}

	await repository.followUserAsync(userId, whomId)
    res.status(200).send("You are now following " + req.params.username)
})

router.delete('/:username/unfollow', async (req,res) =>
{
	const userId = await getUserIdFromJwtToken(req)
	if (userId == null)
	{
		res.sendStatus(401)
		return
	}

	const whomId = await repository.getUserIdAsync(req.params.username)
	if (whomId == null) 
	{
		res.sendStatus(404)
		return
	}

	await repository.unfollowUserAsync(userId, whomId)
	res.status(200).send("You are no longer following " + req.params.username)
})

router.post('/add_message', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req);
    const text = req.body.text;
    if (userId == null || text == '' || text == null) {
        res.sendStatus(400);
        return;
    } else {
		await repository.postMessageAsync(userId, text)
        res.sendStatus(200)
    }
})

router.post('/login', async (req,res) =>
{
    const username = req.body.username
    const password = req.body.password

    if (!(username && password)) res.sendStatus(400)

	const row = await repository.findByUsernameAsync(username)

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

router.post('/register', async (req,res) =>
{
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    //Check if all parameters are given
    if (!(username && email && password)) res.sendStatus(400)

    //Check if any users with that username already exists

	//exists in repo
	const userid = await repository.getUserIdAsync(username)
    
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
			await repository.registerUserAsync(username, email, pw_hash)
            res.sendStatus(200)
        }
        catch 
        {
            res.sendStatus(500)
        }
    }
})
    
router.get('/logout', (req,res) =>
{
	res.clearCookie('accessToken')
	res.redirect('/public_timeline');
	return
})

router.get('/:username', async (req,res) =>
{
    const whomId = await repository.getUserIdAsync(req.params.username)
	const userId = await getUserIdFromJwtToken(req)

    if (whomId == null) 
    {
        res.sendStatus(400)
        return
    }

	//exists in repo
	const messages = await repository.getMessagesAsync(whomId);

    if (messages) {

		var m = []

		//exists in repo isWhoFollowingWhom
		const followed = await repository.getIsWhoFollowingWhomAsync(userId, whomId);

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
		return await repository.getUserIdAsync(verifiedToken.username)
    }
    catch
    {
        return null;
    }
}

app.use(errorLogger);   

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
