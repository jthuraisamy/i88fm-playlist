'use strict';

// Import project modules.
var config = require('./config.js');
var tracks = require('./tracks.js');

// Import node modules.
var express = require('express');
var compress = require('compression');
var morgan = require('morgan');
var mongoose = require('mongoose');

// Configure express.
var app = express();
app.use(compress());
app.use(express.static(__dirname + '/public/build'));
app.use(morgan('tiny'));

// Configure mongoose.
mongoose.connect(config.db.URI);

// API routing.
app.get('/api/recent-tracks', function (req, res) {
    tracks.getRemote(req.query.from, req.query.to, function(results) {
        res.send(results);
    });
});

// Initialize server.
app.listen(config.server.PORT, function() {
    console.log('Waiting for connections on port', config.server.PORT + '...');
});