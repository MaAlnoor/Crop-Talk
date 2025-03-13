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

mongo.main();

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

// Add this console.log message
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
