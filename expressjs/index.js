const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');

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
app.use(express.json())

//Shows a users timeline or if no user is logged in it will
//redirect to the public timeline.  This timeline shows the user's
//messages as well as all the messages of followed users
app.get('/', (req, res) => {
    res.sendStatus(400)
})
  
//Displays the latest messages of all users
app.get('/public', (req,res) =>
{
    res.sendStatus(200)
})

//Displays a users tweets
app.post('/{username}/follow', (req,res) =>
{
    res.sendStatus(200)
})

app.delete('/:username/unfollow', (req,res) =>
{
    res.sendStatus(200)
})

app.post('/add_message', async (req,res) =>
{
    const userId = await getUserIdFromJwtToken(req)
    if (userId == null) res.sendStatus(400)
    else res.status(200).send("userId: " + userId)
})

app.get('/login', async (req,res) =>
{
    const username = req.body.username
    const password = req.body.password

    if (!(username && password)) res.sendStatus(400)

    const query = 'SELECT pw_hash FROM user WHERE username = ?';
    const result = await db.get(query, username)

    if (!result) res.status(400).send("Incorrent username or password")

    try
    {
        await bcrypt.compare(password, result.pw_hash, function(err, result)
        {
            console.log(result)
            if (result)
            {
                const user = {username: username}
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                res.json({accessToken: accessToken})
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
    const query = 'SELECT * FROM user WHERE username = ?';
    const result = await db.get(query, username)
    
    //A user already exists
    if (result)
    {
        res.status(400).send("A user with that username already exists")
    }
    else
    {
        try
        {
            const pw_hash = await bcrypt.hash(req.body.password, 10)
            const query = 'INSERT INTO user (username, email, pw_hash) VALUES (?, ?, ?)'
            await db.run(query, [username, email, pw_hash])
            res.sendStatus(200)
        }
        catch 
        {
            res.sendStatus(500)
        }
    }
})
    
app.delete('/logout', (req,res) =>
{
    res.sendStatus(200)
})

app.get('/:id', (req,res) =>
{
   res.sendStatus(200)
})

async function getUserIdFromJwtToken(req)
{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return null

    try 
    {
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const query = 'SELECT user_id FROM user WHERE username = ?';
        const row = await db.get(query, verifiedToken.username);
        if (row) return row.user_id 
        else return null
    }
    catch
    {
        return null;
    }
}


app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
