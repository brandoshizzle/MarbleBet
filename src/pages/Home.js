import React, { useState } from "react";
import { useRecoilState } from "recoil";
import randomWords from "random-words";
import { usernameState } from "./../state";
import { useHistory } from "react-router-dom";
import Firebase from "firebase";

function Home(props) {
	const db = Firebase.database();
	const [roomCode, setRoomCode] = useState("");
	const [username, setUsername] = useRecoilState(usernameState);
	const [error, setError] = useState("");
	const history = useHistory();

	const onRoomCodeChange = (e) => {
		setRoomCode(e.target.value);
	};

	const onUsernameChange = (e) => {
		setUsername(e.target.value);
	};

	// Generate word, see if it's okay to use it
	const createRoom = () => {
		const roomCode = randomWords(1)[0];
		db.ref(`rooms/${roomCode}`)
			.once("value")
			.then((snapshot) => {
				// Room code found, exit if it's less than one day old
				if (snapshot.val()) {
					const oneDay = 1000 * 60 * 24;
					if (Date.now() - snapshot.val().lastUsed < oneDay) {
						return;
					}
				}
				db.ref(`rooms/${roomCode}`).set({
					code: roomCode,
					lastUsed: Date.now(),
				});

				const roomURL = `/${roomCode}/dashboard`;
				history.push(roomURL);
			});
	};

	// Join room only if it's okay
	const joinRoom = () => {
		if (username === "") {
			setError("Please enter a username");
			return;
		}
		if (roomCode === "") {
			setError("Please enter a room code");
			return;
		}
		localStorage.setItem("username", username);
		db.ref(`rooms/${roomCode}`)
			.once("value")
			.then((snapshot) => {
				// Room code found, exit if it's less than one day old
				if (snapshot.val()) {
					const roomURL = `/${roomCode}`;
					history.push(roomURL);
				} else {
					setError("No room by that name found");
				}
			});

		// axios.get(`/api/${roomCode}/ping`).then((res) => {
		// 	const roomExists = res.data.roomExists;
		// 	if (roomExists) {
		// 		history.push(`/${roomCode}`);
		// 	} else {
		// 		setError('Room does not exist, check or spelling or create a new room!');
		// 	}
		// });
	};

	return (
		<div className="App">
			<header className="App-header">
				<div style={{ width: 500 }}>
					<h1>Marble Bets</h1>
					<br />
					<button onClick={createRoom}>Create Room</button>
					<br />
					<h5>or</h5>
					<input
						type="text"
						placeholder="Enter a display name"
						onChange={onUsernameChange}
						value={username}
						style={{ width: 300 }}
					/>
					<br />
					<input
						type="text"
						placeholder="Room code"
						onChange={onRoomCodeChange}
						value={roomCode}
						style={{ width: 170 }}
					/>
					<button onClick={joinRoom}>Join Room</button>
					<p style={{ color: "red" }}>{error}</p>
				</div>
			</header>
		</div>
	);
}

export default Home;
