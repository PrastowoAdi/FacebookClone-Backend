const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { readdirSync } = require('fs'); 

const app = express();
app.use(express.json());
app.use(cors());

//router
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

//database
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Database connected!"))
.catch((err) => console.log("Error connecting to database", err));

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}...`);
})