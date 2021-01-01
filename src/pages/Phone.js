import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useHistory } from "react-router-dom";
import { usernameState, teams, betTable } from "./../state";
import Firebase from "firebase";

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
	const [rank, setRank] = useState(0);
	const [score, setScore] = useState(0);

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
		db.ref(`${roomCode}/players/${username}`).on("value", (snapshot) => {
			const data = snapshot.val();
			console.log(data);
			if (data.hasOwnProperty("s")) {
				setScore(data.s);
			}
			if (data.hasOwnProperty("r")) {
				setRank(data.r);
			}
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
		let newBets = [...bets, [clickedTeam, e.target.id]];
		setBets(newBets);

		const newBetComponents = newBets.map((arr, i) => {
			let val = 10;
			val = newBets.length === 2 ? 5 : val;
			if (newBets.length === 3) {
				val = i === 0 ? 4 : 3;
			}
			return (
				<li className="betList" key={"bet" + i}>
					{val} on <strong>{teams[arr[0]]}</strong> placing{" "}
					{betTable[arr[1]]}
				</li>
			);
		});

		setBetComponenets(newBetComponents);
	};

	const submitBet = (e) => {
		const betsToSend = {};
		bets.map((arr, i) => {
			betsToSend[i] = [arr[0], arr[1]];
			return i;
		});
		db.ref(`${roomCode}/bets/${username}`).set(betsToSend);
		setBets([]);
		setBetComponenets([]);
		alert("Bet submitted. Good luck!");
	};

	return (
		<div className="App">
			<header className="App-header">
				<div
					style={{
						marginBottom: 0,
						background: "rgba(155,77,202,0.5)",
						width: "100%",
						color: "white",
					}}>
					<p
						style={{
							marginBottom: 0,
						}}>
						<strong>{username}</strong> is in room{" "}
						<strong>{roomCode}</strong>
					</p>
					<p
						style={{
							margin: 0,
						}}>
						You're ranked <strong>{rank}</strong>th with{" "}
						<strong>{score}</strong> points
					</p>
				</div>

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
						<button
							onClick={addBet}
							className="button"
							id="0"
							data-place="first">
							First place
						</button>
						<button
							onClick={addBet}
							className="button"
							id="1"
							data-place="top three">
							Top Three
						</button>
						<button
							onClick={addBet}
							className="button"
							id="2"
							data-place="top half">
							Top Half
						</button>
						<button
							onClick={addBet}
							className="button"
							id="3"
							data-place="last">
							Last
						</button>
					</div>
				</div>
			</header>
		</div>
	);
}

export default Phone;
