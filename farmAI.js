const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//offline Farming Tips
const FarmingTips = {
"water": "Water the crops early in the morning or late afternoon to conserve the water.",
"soil": "Use compost to improve the soil health naturally.", 
"pest": "Use oils such as neem oil or introduce beneficial insects like Ladybugs to reduce pests.",
"crop": "Rotate the crops each season to prevent soil depletion and reduce pests.",
"seeds": "Select seeds suitable for your climate, soil type, and desired harvest time.",
"planting": "Plant marigolds near crops to repel pests, or grow basil alongside tomatoes to enhance growth and flavor.",
"weeding": "Weed regularly to prevent competition for nutrients, especially during the early stages of crop growth.",
"harvest": "Harvest crops early in the morning when temperatures are cooler to maintain freshness and quality.",
};

//Farming Ai route
app.post('/farmAI', (req, res) => {
const { question } = req.body;
console.log("Received question:", question);

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