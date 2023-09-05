import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import connectDB from './config/db';
import UserModel from './models/user';

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY;

connectDB();

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})
app.post('/register', async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new UserModel({ email, username, password: hashedPassword });
    console.log("new user is ", newUser);
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, SECRET_KEY as jwt.Secret , { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();
    console.log("user is ", user)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'suryavanshi@olivetech.com',
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: 'dummyuser7752@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `To reset your password, click the following link: http://your-app.com/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error during password reset request:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;

    user.resetToken = '';
    user.resetTokenExpiration = 0 ;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error during password reset:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

