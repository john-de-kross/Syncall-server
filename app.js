const express = require('express');
const cors = require('cors');
const globalError = require('./utilis/globalError');
const userRoute = require('./ROUTES/userRoute');
const morgan = require('morgan');
const app = express();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',            // for local dev
  'https://syncall-video-call.vercel.app/'      // for production
];

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.get('/', (req, res) => {
    console.log(req.body);
});

app.use(morgan('dev'));



app.use('/api/v1/user', userRoute);

app.use(globalError);


module.exports = app;