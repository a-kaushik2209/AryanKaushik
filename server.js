require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.get('/', (req, res) => {
    res.send("Backend is running.");
});

app.post('/send-message', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // Use your verified email as sender
        to: process.env.EMAIL_USER,
        subject: `New Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        replyTo: email // Set reply-to as the user's email
    };

    try {
        // Verify connection configuration first
        await new Promise((resolve, reject) => {
            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log("Server is ready to take our messages");
                    resolve(success);
                }
            });
        });

        // Send mail with defined transport object
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Error sending email:", err);
                    reject(err);
                } else {
                    console.log("Email sent: " + info.response);
                    resolve(info);
                }
            });
        });

        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error("Failed to send message:", error);
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});