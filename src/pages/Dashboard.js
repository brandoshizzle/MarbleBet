import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { useParams } from 'react-router-dom';
import { usernameState } from './../state';

function Dashboard() {
	const { roomCode } = useParams();
	const [users, setUsers] = useState({});

	return (
		<div className="App">
			<header className="App-header">
				<div className="menu">
					<h4 style={{ margin: 0, display: 'inline-block' }}>
						room code: <strong>{roomCode}</strong>
					</h4>
					<div style={{ float: 'right', display: 'inline-block' }}>
						<button className="button button-small" style={{}}>
							Input results
						</button>
					</div>
					{/* <h4 style=>Marble Bets</h4> */}
				</div>
				<div className="container" style={{ maxWidth: '100%', marginTop: 5 }}>
					<div className="row">
						<div className="column" style={{ paddingRight: 20 }}>
							<div style={{ textAlign: 'left' }}>
								<h3 style={{ textAlign: 'left', marginBottom: 0, display: 'inline-block' }}>
									This Round
								</h3>
								<div style={{ float: 'right', display: 'inline-block' }}>
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
							<h3 style={{ textAlign: 'left', marginBottom: 0 }}>Overall Standings</h3>
							<table>
								<thead>
									<tr>
										<th>Rank</th>
										<th>Name</th>
										<th>Points</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>1</td>
										<td>Stephen Curry</td>
										<td>27</td>
										<td>1,91</td>
										<td>Akron, OH</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
									<tr>
										<td>2</td>
										<td>Klay Thompson</td>
										<td>25</td>
										<td>2,01</td>
										<td>Los Angeles, CA</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</header>
		</div>
	);
}

export default Dashboard;
