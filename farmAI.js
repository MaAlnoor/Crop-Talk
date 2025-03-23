const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//offline Farming Tips
const FarmingTips = {
"watering crops": "Water the crops early in the morning or late afternoon to conserve the water.",
"soil health": "Use compost to improve the soil health naturally.", 
"pest control": "Use oils such as neem oil or introduce beneficial insects like Ladybufs to reduce pests.",
"crop rotation": "Rotate the crops each season to prevent soil depletion and reduce pests.",
};

//Farming Ai route
app.post('/farmAI', (req, res) => {
const { question } = req.body;

if (!question || typeof question !== "string"){
    return res.status(400).json({ error: "Please enter a valid input/question."});
    }

const answer = FarmingTips[question.toLowerCase()] || "Sorry, I currently do not have advice for that topic.";
res.json({ answer });
});

//start the server
app.listen(port, () => {
    console.log('Farm AI server is listening at http://localhost:${port}');
});