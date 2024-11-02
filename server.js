const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Trust proxy settings (if behind a proxy)
app.set('trust proxy', true);

// Define a custom Morgan token for client IP
morgan.token('client-ip', function (req) {
    return req.ip || req.connection.remoteAddress;
});

// Create a write stream for run.log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'run.log'), { flags: 'a' });

// Use morgan middleware to log requests with client IP to run.log
app.use(morgan(':client-ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accessLogStream }));

// Use morgan middleware to print requests with client IP to the console
app.use(morgan(':client-ip :method :url :status :res[content-length] - :response-time ms'));

app.use(express.static('.'));

app.listen(port, () => {
    console.log(`服务器已启动：http://localhost:${port}`);
});
