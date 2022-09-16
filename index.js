
const app = require('./app');
const ip = require('ip');
const Port = process.env.Port || 5000;

let server;



server = app.listen(Port, () => {
    console.log(`Server Listening on http://${ip.address()}:${Port}`);
     // my ip address
});