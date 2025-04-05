// Upewniamy się, że dotenv jest załadowany
require('dotenv').config();

module.exports = {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    tls: {
        rejectUnauthorized: false
    }
}; 