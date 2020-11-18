import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Firebase from "firebase";
import merge from "lodash/merge";
import clone from "lodash/clone";
import { teams } from "./../state";

function LeaderboardRow(props) {
	console.log(props);
	const { playerData, rank } = props;
	const { u, s } = playerData;
	return (
		<tr>
			<td>{rank}</td>
			<td>{u}</td>
			<td>{s}</td>
		</tr>
	);
}

function BetRow(props) {
	console.log(props);
	const { betData } = props;
	const { u, b } = betData;
	const s = "cool";
	return (
		<tr>
			<td>{u}</td>
			<td>{b}</td>
			<td>{s}</td>
		</tr>
	);
}

{
	/* <td>Stephen Curry</td>
<td>
	Orangers place first
	<br />
	Team Momo place top three
	<br />
	Team Primary place top half
	<br />
</td>
<td>
	27
	<br />
	30
	<br />
	80
	<br />
</td>
<td>Akron, OH</td> */
}

const defaultPlayer = {
	u: "name",
	s: 0,
};

function Dashboard() {
	const db = Firebase.database();
	const { roomCode } = useParams();
	const [users, setUsers] = useState({});
	const [bets, setBets] = useState({});
	const [scoreboardRows, setScoreboardRows] = useState([]);

	useEffect(() => {
		var usersRef = db.ref(`${roomCode}/players`);
		usersRef.on("value", function (snapshot) {
			const players = snapshot.val();
			let completePlayers = [];

			// Make sure all player objects match default
			for (const player in players) {
				console.log(defaultPlayer, players[player]);
				completePlayers.push(
					merge(clone(defaultPlayer), players[player])
				);
			}
			// Sort to get rank
			completePlayers.sort(function (a, b) {
				return a.s - b.s;
			});
			// Populate the UI
			let tempLeaderboardRows = [];
			for (var i = 0; i < completePlayers.length; i++) {
				tempLeaderboardRows.push(
					<LeaderboardRow
						playerData={completePlayers[i]}
						rank={i + 1}
						key={i}
					/>
				);
			}
			setUsers(completePlayers);
			setScoreboardRows(tempLeaderboardRows);
		});
		var betsRef = db.ref(`${roomCode}/bets`);
		betsRef.on("value", function (snapshot) {
			const newBets = snapshot.val();
			setBets(newBets);
		});
	}, []);

	const betRows = () => {
		// Populate the UI
		let tempBetRows = [];
		for (var i = 0; i < bets.length; i++) {
			tempBetRows.push(<BetRow betData={bets[i]} key={i} />);
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<div className="menu">
					<h4 style={{ margin: 0, display: "inline-block" }}>
						room code: <strong>{roomCode}</strong>
					</h4>
					<div style={{ float: "right", display: "inline-block" }}>
						<button className="button button-small" style={{}}>
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
									<select id="ageRangeField">
										<option value="0-13">2 teams</option>
										<option value="14-17">4 teams</option>
										<option value="18-23">6 teams</option>
										<option value="24+">8 teams</option>
										<option value="24+">10 teams</option>
										<option value="24+">12 teams</option>
										<option value="24+">14 teams</option>
										<option value="24+">16 teams</option>
										<option value="24+">18 teams</option>
										<option value="24+">20 teams</option>
										<option value="24+">22 teams</option>
										<option value="24+">24 teams</option>
									</select>
								</div>
							</div>

							<table>
								<thead>
									<tr>
										<th>Name</th>
										<th>Bets</th>
										<th>Probability</th>
										<th>Max Winnings</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Stephen Curry</td>
										<td>
											Orangers place first
											<br />
											Team Momo place top three
											<br />
											Team Primary place top half
											<br />
										</td>
										<td>
											27
											<br />
											30
											<br />
											80
											<br />
										</td>
										<td>Akron, OH</td>
									</tr>
									<tr>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
								</tbody>
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
			</header>
		</div>
	);
}

export default Dashboard;
