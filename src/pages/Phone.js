import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useHistory } from "react-router-dom";
import { usernameState, teams, betTable } from "./../state";
import Firebase from "firebase";
import axios from "axios";

function TeamRow(props) {
	const { team1, team2, openCard, teamId } = props;
	return (
		<div className="row">
			<div className="column">
				<button
					style={{ width: "100%" }}
					id={teamId}
					onClick={openCard}>
					{team1}
				</button>
			</div>
			<div className="column">
				<button
					style={{ width: "100%" }}
					id={teamId + 1}
					onClick={openCard}>
					{team2}
				</button>
			</div>
		</div>
	);
}

function Phone() {
	const db = Firebase.database();
	const history = useHistory();
	const { roomCode } = useParams();
	const [teamRows, setTeamRows] = useState([]);
	const [bets, setBets] = useState([]);
	const [betComponents, setBetComponenets] = useState([]);
	const [clickedTeam, setClickedTeam] = useState("");
	const [placementCardShow, setPlacementCardShow] = useState("none");
	const [username, setUsername] = useRecoilState(usernameState);

	// On launch
	useEffect(() => {
		// Check if room exists
		db.ref(`rooms/${roomCode}`)
			.once("value")
			.then((snapshot) => {
				if (!snapshot.val()) {
					history.push("/");
				}
			});

		// Check localstorage for username
		const lsName = localStorage.getItem("username");
		if (username === "") {
			if (lsName !== null) {
				setUsername(lsName);
				db.ref(`${roomCode}/players/${lsName}`).update({
					u: lsName,
				});
			} else {
				history.push("/");
			}
		} else {
			db.ref(`${roomCode}/players/${username}`).update({
				u: lsName,
			});
		}

		// Populate UI with teams
		let tempTeamRows = [];
		for (var i = 0; i < teams.length; i = i + 2) {
			tempTeamRows.push(
				<TeamRow
					team1={teams[i]}
					team2={teams[i + 1]}
					openCard={onTeamClick}
					teamId={i}
					key={teams[i]}
				/>
			);
		}
		setTeamRows(tempTeamRows);

		// Subscribe to score and rank
		db.ref(`${roomCode}/players/${username}`)
			.on("value")
			.then((snapshot) => {
				const data = snapshot.val();
				console.log(data);
			});
	}, []);

	const onTeamClick = (e) => {
		setPlacementCardShow("block");
		setClickedTeam(e.target.id);
	};

	const addBet = (e) => {
		setPlacementCardShow("none");
		if (bets.length === 3) {
			return;
		}
		setBets([...bets, [clickedTeam, e.target.id]]);

		setBetComponenets([
			...betComponents,
			<li key={clickedTeam}>
				{teams[clickedTeam]} will place{" "}
				{e.target.getAttribute("data-place")}
			</li>,
		]);
	};

	const submitBet = (e) => {
		const betsToSend = {};
		bets.map((arr, i) => {
			betsToSend[i] = [arr[0], betTable[arr[1]]];
			return i;
		});
		axios
			.patch(
				`https://marblebet.firebaseio.com/${roomCode}/bets/${username}.json`,
				betsToSend
			)
			.then((res) => {
				console.log(res);
				setBets([]);
				setBetComponenets([]);
				alert("Bet submitted. Good luck!");
			});
	};

	return (
		<div className="App">
			<header className="App-header">
				<p
					style={{
						marginBottom: 0,
						background: "rgba(155,77,202,0.5)",
						width: "100%",
						color: "white",
					}}>
					<strong>{username}</strong> is in room{" "}
					<strong>{roomCode}</strong>
				</p>
				<h4 style={{ marginBottom: 1, marginTop: 14 }}>
					Place up to 3 bets
				</h4>
				<h5>10 chips will be evenly split among them</h5>
				<div className="container">{teamRows}</div>
				<h5>Summary</h5>
				<div id="bet-summary">
					<ol>{betComponents}</ol>
				</div>
				<div>
					<button
						className="button button-outline"
						onClick={() => {
							setBetComponenets([]);
							setBets([]);
						}}>
						Clear Bets
					</button>
					<button className="button" onClick={submitBet}>
						Submit Bets
					</button>
				</div>
				<div
					id="mask"
					style={{ display: placementCardShow }}
					onClick={() => setPlacementCardShow("none")}>
					<div id="placement-card">
						<h3>{teams[clickedTeam]}</h3>
						<p>will come in...</p>
						<button onClick={addBet} id="f" data-place="first">
							First place
						</button>
						<button onClick={addBet} id="t" data-place="top three">
							Top Three
						</button>
						<button onClick={addBet} id="h" data-place="top half">
							Top Half
						</button>
						<button onClick={addBet} id="l" data-place="last">
							Last
						</button>
					</div>
				</div>
			</header>
		</div>
	);
}

export default Phone;
