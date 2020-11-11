import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useHistory } from 'react-router-dom';
import { usernameState, teams } from './../state';
import axios from 'axios';

function TeamRow(props) {
	const { team1, team2, openCard } = props;
	return (
		<div className="row">
			<div className="column">
				<button style={{ width: '100%' }} id={team1} onClick={openCard}>
					{team1}
				</button>
			</div>
			<div className="column">
				<button style={{ width: '100%' }} id={team2} onClick={openCard}>
					{team2}
				</button>
			</div>
		</div>
	);
}

function Phone() {
	const { roomCode } = useParams();
	const [teamRows, setTeamRows] = useState([]);
	const [bets, setBets] = useState([]);
	const [betComponents, setBetComponenets] = useState([]);
	const [clickedTeam, setClickedTeam] = useState('');
	const [placementCardShow, setPlacementCardShow] = useState('none');
	const [username, setUsername] = useRecoilState(usernameState);
	const history = useHistory();

	// On launch
	useEffect(() => {
		// Check if room exists
		axios.get(`/api/${roomCode}/ping`).then((res) => {
			if (!res.data.roomExists) {
				history.push('/');
			}
		});
		// Check localstorage for username
		if (username === '') {
			if (localStorage.getItem('username') !== null) {
				setUsername(localStorage.getItem('username'));
			} else {
				history.push('/');
			}
		}

		// Populate UI with teams
		let tempTeamRows = [];
		for (var i = 0; i < teams.length; i = i + 2) {
			tempTeamRows.push(<TeamRow team1={teams[i]} team2={teams[i + 1]} openCard={onTeamClick} key={teams[i]} />);
		}
		setTeamRows(tempTeamRows);
	}, []);

	const onTeamClick = (e) => {
		setPlacementCardShow('block');
		setClickedTeam(e.target.id);
	};

	const addBet = (e) => {
		setPlacementCardShow('none');
		if (bets.length === 3) {
			return;
		}
		setBets([...bets, [clickedTeam, e.target.id]]);
		setBetComponenets([
			...betComponents,
			<li key={clickedTeam}>
				{clickedTeam} will place {e.target.id.replace('-', ' ')}
			</li>,
		]);
	};

	const submitBet = (e) => {
		axios
			.post('/api/bet', {
				roomCode,
				username,
				bets,
			})
			.then((res) => {
				console.log(res);
			});
	};

	return (
		<div className="App">
			<header className="App-header">
				<p style={{ marginBottom: 0, background: 'rgba(155,77,202,0.5)', width: '100%', color: 'white' }}>
					<strong>{username}</strong> is in room <strong>{roomCode}</strong>
				</p>
				<h4 style={{ marginBottom: 1, marginTop: 14 }}>Place up to 3 bets</h4>
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
						}}
					>
						Clear Bets
					</button>
					<button className="button" onClick={submitBet}>
						Submit Bets
					</button>
				</div>
				<div id="mask" style={{ display: placementCardShow }} onClick={() => setPlacementCardShow('none')}>
					<div id="placement-card">
						<h3>{clickedTeam}</h3>
						<p>will come in...</p>
						<button onClick={addBet} id="first">
							First place
						</button>
						<button onClick={addBet} id="top-three">
							Top Three
						</button>
						<button onClick={addBet} id="top-half">
							Top Half
						</button>
						<button onClick={addBet} id="last">
							Last
						</button>
					</div>
				</div>
			</header>
		</div>
	);
}

export default Phone;
