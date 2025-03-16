const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const mongo = require('./Mongo.js');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Run mongo.js main function
mongo.main();

// Add user to database with given data
app.post('/signup', async (req, res) => {
    const { username, email, name, password } = req.body;

    try {
        await mongo.insertUser(username, email, name, password);
        res.status(200).send('Signup successful!');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send(err.message);
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
