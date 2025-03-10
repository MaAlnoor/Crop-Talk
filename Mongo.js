const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://Me123:Croptalk@croptalk.2iljc.mongodb.net/?retryWrites=true&w=majority&appName=CropTalk";
const dbName = "Accounts";
const collectionName = "Username";
let collection; // We'll store the collection here

if (window.userInputFromCollector) {
    let receivedData = window.userInputFromCollector;
    console.log("Receiver: I received: " + receivedData);
    // You can now use the receivedData in this file.
    alert("The receiver got the information: " + receivedData);
} else {
    alert("Receiver: No data received yet.");
}

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const db = client.db(dbName);
        collection = db.collection(collectionName); // Store the collection

    } catch (err) {
        console.error("Error:", err);
    }
}

async function checkLogin(username, password) {
    if (!collection) {
        alert("Database collection is not ready.");
        return;
    }

    try {
        const user = await collection.findOne({ username: username, password: password });

        if (user) {
            alert("Login successful!");
        } else {
            alert("Login failed. Username or password incorrect.");
        }
    } catch (err) {
        console.error("Error during login check:", err);
        alert("An error occurred during login.");
    }
}

function print(){
    alert("hi")
}

main(); // Start the database connection
//checkLogin(document.getElementById("username"),document.getElementById("password"))



