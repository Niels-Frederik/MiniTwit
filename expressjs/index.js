const express = require("express");
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

var db = new sqlite3.Database('../tmp/minitwit.db');

const app = express();
const port = 5000;
app.use(express.json())

//Shows a users timeline or if no user is logged in it will
//redirect to the public timeline.  This timeline shows the user's
//messages as well as all the messages of followed users
app.get('/', (req, res) => {
    const remoteAddress = req.socket.remoteAddress;
    const ip = remoteAddress.replace(/^.*:/, '')
    console.log("We got a visitor from: " + ip);
    //res.redirect('public_timeline');
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

app.post('/add_message', (req,res) =>
{
    res.sendStatus(200)
})

app.get('/login', async (req,res) =>
{
    const username = req.body.username
    const password = req.body.password

    if(username && password)
    {
        //Get hashed password from database
        db.get('SELECT pw_hash FROM user WHERE username = ?', username, async (err,row) =>
        {
            //If a user with this username exists get the password
            if (row)
            {
               await bcrypt.compare(password, row.pw_hash, (err, compareResult) =>
               {
                   if (err)
                   {
                       console.log(err.message)
                   }
                   if (compareResult)
                   {
                       res.status(200).send("Succesful login")
                   }
                   else
                   {
                       res.status(400).send("Incorrect password or username")
                   }
               })
            }
        })
    } else res.status(400).send("username or password not given")
})

app.post('/register', async (req,res) =>
{
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    //Check if all parameters are given
    if (username && email && password)
    {
        //Check if any users with that username already exists
        db.get('SELECT * FROM user WHERE username = ?', username, async (err,row) =>
        {
            //No users are found
            if (!row)
            {
                try
                {
                    //Salt and hash the password
                    const pw_hash = await bcrypt.hash(req.body.password, 10)
                    //Add the user to the database
                    db.run('INSERT INTO user (username, email, pw_hash) VALUES (?, ?, ?)', [username, email, pw_hash], (err) =>
                    {
                        if (err) throw error 
                    })
                    res.sendStatus(200)
                }
                catch 
                {
                    res.sendStatus(500)
                }
            } else {
                res.status(400).send("A user with that username already exists")
            }
        })
    }
})


app.get('/logout', (req,res) =>
{
    //res.send('You were logged out');
    // Remove user_id form session
    res.redirect('/public_timeline');
})

app.get('/:id', (req,res) =>
{
   res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
