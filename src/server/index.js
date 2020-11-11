const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db/db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ rooms: {} }).write();

const app = express();
const server = require('http').createServer(app);
// const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../../build')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/api/:roomCode/ping', (req, res) => {
	const roomExists = db.has(`rooms.${req.params.roomCode}`);
	res.send(roomExists);
});

app.get('/api/:roomCode/create', (req, res) => {
	const roomExists = db.has(`rooms.${req.params.roomCode}`);
	// Uh oh, room is already in the db
	if (roomExists) {
		// When was it created? If less than 24 hours ago, then let it be.
		const createdDate = db.get(`rooms.${req.params.roomCode}.created`).value();
		if (Date.now() - createdDate < 86400000) {
			res.send(`Room ${req.params.roomCode} is being used by someone else`);
		}
	}
	// If doesn't exist or more than 24 hours old, create new room.
	const newRoom = { ...defaultRoom, roomCode: req.params.roomCode, created: Date.now() };
	db.set(`rooms.${req.params.roomCode}`, newRoom).write();
	res.send(`Created room ${req.params.roomCode}`);
});

app.post('api/:roomCode/join', (req, res) => {
	const userExists = db.has(`rooms.${req.params.roomCode}.${req.body.username}`);
	if (!userExists) {
		const newUser = {
			username: req.body.username,
			totalPoints: 0,
			placedBets: [],
		};
		db.set(`rooms.${req.params.roomCode}.users.${req.body.username}`, newUser).write();
	}
	res.send(`${req.body.username} joined room ${req.params.roomCode}`);
	// Socket this information out to dashboards
});

app.post('/api/bet', (req, res) => {
	console.log(req.body);
	const { roomCode, username, bets } = req.body;
	db.set(`rooms.${roomCode}.users.${username}.bets`, bets).write();
	res.sendStatus(200).send('Yeah we got your bet.');
	// Socket this information to dashboards
});

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// sockets test
// io.on('connection', (socket) => socket.emit('hello', { message: 'hello from server!' }));

server.listen(port);

const defaultRoom = {
	roomCode: '',
	created: '',
	users: {},
};
