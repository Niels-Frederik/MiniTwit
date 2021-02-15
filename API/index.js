const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookie_parser = require('cookie-parser')
const cors = require('cors')

const { Op } = require('sequelize');
const database = require('./entities');

//const db = open({'../tmp/minitwit.db', driver: sqlite3.Database});
//const dbPromise = createDbConnection("../tmp/minitwit.db")

var db = null;

(async () => {
    // open the database
    db = await open({
      filename: '../tmp/minitwit.db',
      driver: sqlite3.Database
    })
})()


const app = express();
const port = 5000;
app.use(cookie_parser())
app.use(express.json())
app.use(cors())

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
    if (userId == null) res.redirect("public");
    const query = "select user.username, message.text, message.pub_date from message, user where message.flagged = 0 \
                   and message.author_id = user.user_id and (user.user_id = ? or user.user_id \
                   in (select whom_id from follower where who_id = ?)) \
                   order by message.pub_date desc limit ?"
    const result = await db.all(query, [userId, userId, 30])
    //res.setHeader("")
    //res.header("Access-Control-Allow-Origin", "*");
    //res.status(200).send(JSON.stringify(result))
    res.send(result)
})
  
//Displays the latest messages of all users
app.get('/public_timeline', async (req,res) =>
{
    const remoteAddress = req.socket.remoteAddress;
    const ip = remoteAddress.replace(/^.*:/, '');
    console.log("We got a visitor from: " + ip);

    const PER_PAGE = 30;
    const query =   `select u.username, m.text, m.pub_date from message as m left join user as u ` +
                    `where m.author_id = u.user_id and m.flagged = 0 ` +
                    `order by m.pub_date desc limit ${PER_PAGE}`;
    const result = await db.all(query);
    //res.status(200).send(JSON.stringify(result))
    res.send(result);
    //return;
})

//Displays a users tweets
app.post('/:username/follow', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req)
	if (userId == null) 
	{
		res.sendStatus(401)
		return
	}
	const whomId = await getUserId(req.params.username)
	if (whomId == null) 
	{
		res.sendStatus(404)
		return
	}
	await database.Followers.create({
		who_id: userId,
		whom_id: whomId
	})
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
	const whomId = await getUserId(req.params.username)
	if (whomId == null) 
	{
		res.sendStatus(404)
		return
	}
	await database.Followers.destroy({
		where: {
			who_id: userId,
			whom_id: whomId
		}
	})
	res.status(200).send("You are no longer following " + req.params.username)
	//res.redirect()
})

app.post('/add_message', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req);
    const text = req.body.text;
    if (userId == null || text == '') {
        res.sendStatus(400);
        return;
    } else {
		const date = (Math.floor(Date.now()/1000))
		await database.Messages.create({
			author_id: userId,
			text: text,
			pub_date: date,
			flagged: 0
		})
        res.sendStatus(200)
    }
})

app.get('/login', async (req,res) =>
{
    const username = req.body.username
    const password = req.body.password

    if (!(username && password)) res.sendStatus(400)

	const row = await database.Users.findOne({
		where: {
			username: username
		}
	})

    if (!row) 
    {
        res.status(400).send("Incorrent username or password")
        return
    }

    try
    {
        await bcrypt.compare(password, row.pw_hash, function(err, row)
        {
            console.log(row)
            if (row)
            {
                const user = {username: username}
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

                let options = {
                    httpOnly: true, // The cookie only accessible by the web server
                    signed: false // Indicates if the cookie should be signed
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

    //Check if any users with that username already exists
	const userid = await getUserId(username)
    
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
			await database.Users.create({
				username: username,
				email: email,
				pw_hash: pw_hash
			});
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
    res.redirect('/public_timeline');
})

app.get('/:username', async (req,res) =>
{
    const userId = await getUserId(req.params.username)
    if (userId == null) 
    {
        res.sendStatus(400)
        return
    }

	const messages = await database.Messages.findAll({
		where: {
			author_id: author_id
		}

	});
    if (messages) {
        res.json(messages).send;
    } else {
        res.sendStatus(400);
        return
    }

})

async function getUserIdFromJwtToken(req)
{
    const token = req.cookies.accessToken
    if (token == null) return null

    try 
    {
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		return await getUserId(verifiedToken.username)
    }
    catch
    {
        return null;
    }
}


app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})


async function getUserId(username)
{
	const user = await database.Users.findOne({
		where: {
			username: username
		}
	});
	if (user) return user.user_id
	return null;
}
