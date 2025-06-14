require('dotenv').config();
const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
    res.send("Backend is running.");
});

app.post('/send-message', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            message: 'Email service not configured properly. Please contact the administrator.'
        });
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${message}</p>
        </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>', // You'll update this after domain verification
            to: process.env.EMAIL_USER, // Your email to receive messages
            subject: `New Contact Form Submission from ${name}`,
            html: htmlContent,
            reply_to: email
        });

        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send message', 
                error: error.toString() 
            });
        }

        console.log("Email sent with ID:", data.id);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error("Failed to send message:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message', 
            error: error.toString() 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});