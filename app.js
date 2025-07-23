const express = require('express');
const cors = require('cors');
const globalError = require('./utilis/globalError');
const userRoute = require('./ROUTES/userRoute');
const morgan = require('morgan');
const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 

}))

app.get('/', (req, res) => {
    console.log(req.body);
});

app.use(morgan('dev'));



app.use('/api/v1/user', userRoute);

app.use(globalError);


module.exports = app;