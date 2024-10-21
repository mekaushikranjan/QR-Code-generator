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
     res.sendFile(path.join(__dirname, 'public', 'index.html'));
  
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
    }`
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

