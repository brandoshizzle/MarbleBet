import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Autocomplete from "react-autocomplete";
import Firebase from "firebase";
import merge from "lodash/merge";
import clone from "lodash/clone";
import { betTable, teams } from "./../state";

function LeaderboardRow(props) {
	const { playerData } = props;
	const { u, s, r } = playerData;
	return (
		<tr>
			<td>{r}</td>
			<td>{u}</td>
			<td>{s}</td>
		</tr>
	);
}

function BetRow(props) {
	const { betData, player, numTeams } = props;
	const betDataDisplay = betData.map((arr, i) => {
		let val = 10;
		val = betData.length === 2 ? 5 : val;
		if (betData.length === 3) {
			val = i === 0 ? 4 : 3;
		}
		return (
			<li className="betList" key={"bet" + i}>
				{val} on <strong>{teams[arr[0]]}</strong> placing{" "}
				{betTable[arr[1]]}
			</li>
		);
	});
	let odds = [];
	const oddsRow = betData.map((arr, i) => {
		let numerator = arr[1] === "1" ? 3 : 1;
		numerator = arr[1] === "2" ? numTeams / 2 : numerator;
		odds.push(numerator / numTeams);
		let denominator = numTeams - numerator;
		if (denominator % numerator === 0) {
			denominator = denominator / numerator;
			numerator = 1;
		}
		return (
			<li className="betList" key={"odds" + i}>
				{numerator}:{denominator}
			</li>
		);
	});
	function maxWinnings() {
		if (odds.length === 1) {
			return (1 / odds[0]) * 10;
		} else if (odds.length === 2) {
			return (1 / odds[0]) * 5 + (1 / odds[1]) * 5;
		} else {
			return (1 / odds[0]) * 4 + (1 / odds[1]) * 3 + (1 / odds[2]) * 3;
		}
	}
	return (
		<tr>
			<td>{player}</td>
			<td>{betDataDisplay}</td>
			<td>{oddsRow}</td>
			<td>{Math.floor(maxWinnings())} points</td>
		</tr>
	);
}

const defaultPlayer = {
	u: "name",
	s: 0,
	r: 0,
};

function Dashboard() {
	const db = Firebase.database();
	const { roomCode } = useParams();
	const [users, setUsers] = useState({});
	const [bets, setBets] = useState({});
	const [scoreboardRows, setScoreboardRows] = useState([]);
	const [betRows, setBetRows] = useState([]);
	const [numTeams, setNumTeams] = useState(8);
	const [inputCardShow, setInputCardShow] = useState("none");
	const [inputVal, setInputVal] = useState("");
	const [inputRows, setInputRows] = useState([]);

	let likelyInputVal;

	useEffect(() => {
		// Get and subscribe to player data
		var usersRef = db.ref(`${roomCode}/players`);
		usersRef.on("value", function (snapshot) {
			console.log("New players rendering");
			const players = snapshot.val();
			let completePlayers = [];

			// Make sure all player objects match default
			for (const player in players) {
				// console.log(defaultPlayer, players[player]);
				completePlayers.push(
					merge(clone(defaultPlayer), players[player])
				);
			}
			// Sort to get rank
			completePlayers.sort(function (a, b) {
				return b.s - a.s;
			});
			completePlayers = completePlayers.map((playerObj, i) => {
				return { ...playerObj, r: i + 1 };
			});
			// Populate the UI
			let tempLeaderboardRows = [];
			for (var i = 0; i < completePlayers.length; i++) {
				tempLeaderboardRows.push(
					<LeaderboardRow playerData={completePlayers[i]} key={i} />
				);
			}
			setUsers(completePlayers);
			setScoreboardRows(tempLeaderboardRows);
		});

		// Get and update bets
		var betsRef = db.ref(`${roomCode}/bets`);
		betsRef.on("value", function (snapshot) {
			const newBets = snapshot.val();
			setBets(newBets);
			let tempBetRows = [];
			for (const player in newBets) {
				tempBetRows.push(
					<BetRow
						betData={newBets[player]}
						player={player}
						numTeams={numTeams}
						key={player}
					/>
				);
			}
			setBetRows(tempBetRows);
		});
	}, []);

	const inputKeyDown = (event) => {
		if (event.key === "Enter") {
			let newInputRows = inputRows;
			newInputRows.push(<li key={likelyInputVal}>{likelyInputVal}</li>);
			setInputRows(newInputRows);
			setInputVal("");
		}
	};

	function calculateScores() {
		// Return results to array
		const resultNums = inputRows.map((val, index) => {
			return teams.indexOf(val.key);
		});
		// If only 2 teams are competing, fill a third so top 3 doesn't break
		if (resultNums.length === 2) {
			resultNums[2] = 10000;
		}
		// Set new player data
		let newPlayerData = {};
		for (var p = 0; p < users.length; p++) {
			newPlayerData[users[p]["u"]] = users[p];
		}
		console.log(resultNums);
		// For each player, determine if any of their bets won
		for (const player in bets) {
			const playerBets = bets[player];
			let winnings = [];
			let numBets = playerBets.length;
			// Calculate multiplier for each bet and store it in winnings
			for (var i = 0; i < numBets; i++) {
				const team = playerBets[i][0];
				const place = playerBets[i][1];
				console.log(team, place);
				switch (place) {
					case "0": // First place bet
						winnings[i] = resultNums[0] == team ? numTeams : 0;
						break;
					case "1": // Top Three bet
						winnings[i] =
							resultNums[0] == team ||
							resultNums[1] == team ||
							resultNums[2] == team
								? Math.floor(numTeams / 3)
								: 0;
						break;
					case "3": // Last place bet
						winnings[i] =
							resultNums[resultNums.length - 1] == team
								? numTeams
								: 0;
						break;
					case "2": // Top half bet
						winnings[i] = 0;
						for (var j = 0; j < numTeams / 2; j++) {
							if (resultNums[j] == team) {
								winnings[i] = 2;
							}
						}
						break;
					default:
						break;
				}
			}
			// Take winning multipliers and multiply by bets
			let totalWinnings;
			if (winnings.length === 1) {
				totalWinnings = winnings[0] * 10;
			} else if (winnings.length === 2) {
				totalWinnings = winnings[0] * 5 + winnings[1] * 5;
			} else {
				totalWinnings =
					winnings[0] * 4 + winnings[1] * 3 + winnings[2] * 3;
			}
			newPlayerData[player] = {
				...newPlayerData[player],
				s: newPlayerData[player]["s"] + totalWinnings,
			};
		}
		console.log(newPlayerData);
		// Sync to the cloud
		db.ref(`${roomCode}/players`).set(newPlayerData);
		setInputCardShow("none");
		// setUsers(newPlayerData);
	}

	return (
		<div className="App">
			<header className="App-header">
				<div className="menu">
					<h4 style={{ margin: 0, display: "inline-block" }}>
						room code: <strong>{roomCode}</strong>
					</h4>
					<div style={{ float: "right", display: "inline-block" }}>
						<button
							className="button button-small"
							style={{}}
							onClick={() => {
								setInputCardShow("block");
							}}>
							Input results
						</button>
					</div>
					{/* <h4 style=>Marble Bets</h4> */}
				</div>
				<div
					className="container"
					style={{ maxWidth: "100%", marginTop: 5 }}>
					<div className="row">
						<div className="column" style={{ paddingRight: 20 }}>
							<div style={{ textAlign: "left" }}>
								<h3
									style={{
										textAlign: "left",
										marginBottom: 0,
										display: "inline-block",
									}}>
									This Round
								</h3>
								<div
									style={{
										float: "right",
										display: "inline-block",
									}}>
									<select
										id="teamsField"
										value={numTeams}
										onChange={(e) => {
											setNumTeams(e.target.value);
											let tempBetRows = [];
											for (const player in bets) {
												tempBetRows.push(
													<BetRow
														betData={bets[player]}
														player={player}
														numTeams={
															e.target.value
														}
														key={player}
													/>
												);
											}
											setBetRows(tempBetRows);
										}}>
										<option value="2">2 teams</option>
										<option value="4">4 teams</option>
										<option value="6">6 teams</option>
										<option value="8">8 teams</option>
										<option value="10">10 teams</option>
										<option value="12">12 teams</option>
										<option value="14">14 teams</option>
										<option value="16">16 teams</option>
										<option value="18">18 teams</option>
										<option value="20">20 teams</option>
										<option value="22">22 teams</option>
										<option value="24">24 teams</option>
									</select>
								</div>
							</div>

							<table>
								<thead>
									<tr>
										<th>Name</th>
										<th>Bets</th>
										<th>Odds</th>
										<th>Possible Winnings</th>
									</tr>
								</thead>
								<tbody>{betRows}</tbody>
							</table>
						</div>

						<div className="column">
							<h3 style={{ textAlign: "left", marginBottom: 0 }}>
								Overall Standings
							</h3>
							<table>
								<thead>
									<tr>
										<th>Rank</th>
										<th>Name</th>
										<th>Points</th>
									</tr>
								</thead>
								<tbody>{scoreboardRows}</tbody>
							</table>
						</div>
					</div>
				</div>
				<div
					id="mask"
					style={{ display: inputCardShow }}
					// onClick={() => setInputCardShow("none")}
				>
					<div id="placement-card">
						<h3>Input results of round</h3>
						<Autocomplete
							getItemValue={(item) => item}
							shouldItemRender={(item, value) =>
								item
									.toLowerCase()
									.indexOf(value.toLowerCase()) > -1
							}
							items={teams}
							renderItem={(item, isHighlighted) => {
								if (isHighlighted) {
									likelyInputVal = item;
								}
								if (inputVal === "") {
									return <div></div>;
								}
								return (
									<div
										style={{
											background: isHighlighted
												? "lightgray"
												: "white",
										}}>
										{item}
									</div>
								);
							}}
							value={inputVal}
							onChange={(e) => setInputVal(e.target.value)}
							onSelect={(val) => setInputVal(val)}
							renderInput={(props) => {
								return (
									<input
										{...props}
										onKeyDown={inputKeyDown}
									/>
								);
							}}
						/>
						<ol>{inputRows}</ol>
						<button
							className="button-outline"
							onClick={() => {
								setInputRows([]);
							}}>
							Clear Results
						</button>
						<button
							onClick={() => {
								calculateScores();
							}}>
							Submit
						</button>
					</div>
				</div>
			</header>
		</div>
	);
}

export default Dashboard;
