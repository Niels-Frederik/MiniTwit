import Express from "express";
import sqlite3 from "sqlite3"

var db = new sqlite3.Database('../tmp/minitwit.db');

const app = Express();
const port = 5000;


//Shows a users timeline or if no user is logged in it will
//redirect to the public timeline.  This timeline shows the user's
//messages as well as all the messages of followed users
app.get('/', (req, res) => {

})
  
//Displays the latest messages of all users
app.get('/public', (req,res) =>
{
    res.sendStatus(200)
})

//Displays a users tweets
app.get('/:id', (res,req) =>
{
    res.sendStatus(200)
})

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

app.get('/login', (req,res) =>
{
    res.sendStatus(200)
})

app.post('/register', (req,res) =>
{
    res.sendStatus(200)
})

app.delete('/logout', (req,res) =>
{
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
