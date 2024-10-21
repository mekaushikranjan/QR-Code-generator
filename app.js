import express from 'express';
import qr from 'qr-image';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use ES module alternative to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory (HTML, CSS, and generated QR image)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML form from the public directory
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Generator</title>
    <style>
    /* Global Styles */
body {
    font-family: Arial, sans-serif;
    background-color: #f0f4f8;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.container {
    background-color: #fff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
}

form {
    margin-bottom: 1.5rem;
}

label {
    font-size: 1.1rem;
    color: #555;
}

input[type="text"] {
    width: 100%;
    padding: 0.8rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
}

button {
    background-color: #28a745;
    color: white;
    padding: 0.8rem 1.2rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
}

button:hover {
    background-color: #218838;
}

.qr-container {
    margin-top: 1.5rem;
}

.qr-container img {
    max-width: 100%;
    border: 1px solid #ccc;
    padding: 0.5rem;
    border-radius: 10px;
}
 </style>
</head>
<body>
    <div class="container">
        <h1>QR Code Generator</h1>
        <form action="/generate" method="POST">
            <label for="input">Enter Text (can be anything):</label>
            <input type="text" id="input" name="input" placeholder="Enter text, number, or URL" required>
            <button type="submit">Generate QR Code</button>
        </form>
        <div class="qr-container">
            <h2>Generated QR Code:</h2>
            <img src="/qr_img.png" alt="Your QR code will appear here" onerror="this.style.display='none'">
        </div>
    </div>
</body>
</html>

});

// Handle form submission and generate QR code
app.post('/generate', (req, res) => {
    const inputText = req.body.input?.trim(); // Trim and validate input

    if (!inputText) {
        return res.status(400).send('Invalid input. Please provide valid text.');
    }

    const qrImagePath = path.join(__dirname, 'public', 'qr_img.png');

    try {
        // Generate the QR code image and pipe it to the write stream
        const qr_svg = qr.image(inputText, { type: 'png' });
        const stream = fs.createWriteStream(qrImagePath);

        qr_svg.pipe(stream);

        stream.on('finish', () => {
            // The QR code image is now ready, redirect to display it
            res.redirect('/');
        });

        stream.on('error', (err) => {
            console.error("Error writing QR image:", err);
            res.status(500).send("Error generating QR code.");
        });

        // Also save the input text to a text file
        fs.writeFile('input.txt', inputText, (err) => {
            if (err) throw err;
            console.log('The input has been saved!');
        });

    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).send("Failed to generate QR code. Invalid input data.");
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

