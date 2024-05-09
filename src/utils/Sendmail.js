// import React from 'react'
import { ApiError } from './ApiError.js';
import nodemailer from "nodemailer";

const Sendmail = async (email, subject, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: 'logixhunttech@quizlogix.com',
                pass: 'LGF55@#$4de$#'
            }
        });

        const mailOptions = {
            from: 'logixhunttech@quizlogix.com',
            to: email,
            subject: subject,
            html: body
        };

        // Send the email and await the result
        const info = await transporter.sendMail(mailOptions);
        // console.log("info=", info);
        return info.response;
    } catch (error) {
        // console.error('Error sending email:', error);
        throw new ApiError(error.responseCode || 500, error.response || 'Server Error in SmsSend')
    }
}

export default Sendmail
