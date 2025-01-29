import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { convert } from "./controllers/convertController.js";


// Configuration
dotenv.config();
const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post("/convert", convert);

// Test endpoint
app.get('/', (req, res) => {
    res.send('Hello World!');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});