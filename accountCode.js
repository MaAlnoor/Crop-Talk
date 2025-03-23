const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { ObjectId } = require('mongodb');
const mongo = require('./Mongo.js');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Run mongo.js main function
mongo.main();

// Add user to database with given data
app.post('/signup', async (req, res) => {
    const { type, username, email, name, password, admin } = req.body;

    const salt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(password, salt);

    try {
        await mongo.insertUser(type, username, email, name, hash, admin);
        res.status(200).send('Signup successful!');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send(err.message);
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await mongo.getPosts(); // Fetch posts from the database
        res.status(200).json(posts); // Send posts as JSON response
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Failed to fetch posts');
    }
});


// Add post to database with given data
app.post('/postpage', async (req, res) => {
    const { type, username, question, upvotes, downvotes, reports, date} = req.body;

    try {
        await mongo.insertPost(type, username, question, upvotes, downvotes, reports, date);
        res.status(200).send('Successfully Posted!');
    } catch (err) {
        console.error('Posting Error:', err);
        res.status(500).send(err.message);
    }
});

// Add reply to database with given data
app.post('/reply', async (req, res) => {
    const { type, username, question, answer, upvotes, downvotes, reports, date } = req.body;

    try {
        await mongo.insertReply(type, username, question, answer, upvotes, downvotes, reports, date);
        res.status(200).send('Reply submitted successfully!');
    } catch (err) {
        console.error('Error submitting reply:', err);
        res.status(500).send(err.message);
    }
});

app.get('/replies', async (req, res) => {
    try {
        const replies = await mongo.getReplies(); // Fetch replies from the database
        res.status(200).json(replies); // Send replies as JSON response
    } catch (err) {
        console.error('Error fetching replies:', err);
        res.status(500).send('Failed to fetch replies');
    }
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const loginSuccess = await mongo.checkLogin(username, password);
        
        if (loginSuccess) {
            res.status(200).send('Login successful!');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send(err.message);
    }
});

// Ensure that server is running
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

