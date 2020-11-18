import { atom } from "recoil";

export const usernameState = atom({
	key: "usernameState",
	default: "",
});

export const roomCodeState = atom({
	key: "roomCodeState",
	default: "",
});

// const roomInfoExample = {
// 	code: 'code',
// 	connectedUsers: {
// 		sally: {
// 			bets: [
// 				['Orangers', 'first'],
// 				['Chocolatiers', 'top-three'],
// 			],
// 			points: 200,
// 		},
// 	},
// };

export const teams = [
	"Balls of Chaos",
	"Black Jacks",
	"Bumblebees",
	"Chocolatiers",
	"Crazy Cat's Eyes",
	"Gliding Glaciers",
	"Golden Orbs",
	"Green Ducks",
	"Hazers",
	"Hornets",
	"Indigo Stars",
	"Jawbreakers",
	"Jungle Jumpers",
	"Kobalts",
	"Limers",
	"Mellow Yellow",
	"Midnight Wisps",
	"Minty Maniacs",
	"O'Rangers",
	"Oceanics",
	"Pinkies",
	"Quicksilvers",
	"Raspberry Racers",
	"Rojo Rollers",
	"Savage Speeders",
	"Shining Swarm",
	"Snowballs",
	"Team Galactic",
	"Team Momary",
	"Team Momo",
	"Team Plasma",
	"Team Primary",
	"Thunderbolts",
	"Turtle Sliders",
];
