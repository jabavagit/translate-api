import dotenv from 'dotenv';
import express from 'express';
const morgan = require('morgan');
import { PORT } from './constants';
const createError = require('http-errors');
const routes = require('./routes/routes');
const cors = require('cors');
import * as dbServices from './services/db-services';

const port = PORT.SERVER;
const app = express();

dbServices.init();

/********************************************************************
 * SERVER
 ******************************************************************* */
dotenv.config();

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true}));
app.use(express.json({ limit: '50mb' }));
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
    next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        error: err
    });
});

// start the express server
app.listen(port, () => {
    console.log(`[SERVER]: Server is running at http://localhost:${port}`);
});
