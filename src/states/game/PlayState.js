import State from "../../../lib/State.js";
import Player from "../../entities/Player.js";
import GameStateName from "../../enums/GameStateName.js";
import SoundName from "../../enums/SoundName.js";
import { sounds, stateMachine, timer } from "../../globals.js";
import Dungeon from "../../objects/Dungeon.js";
import UserInterface from "../../services/UserInterface.js";

export default class PlayState extends State {
	constructor() {
		super();

		this.player = new Player();
		this.dungeon = new Dungeon(this.player);

		Player.DUNGEON = this.dungeon;

		this.userInterface = new UserInterface(this.player);
	}

	enter() {
		this.player.reset();
		this.dungeon = new Dungeon(this.player);
		Player.DUNGEON = this.dungeon;
		sounds.play(SoundName.Music);
	}

	update(dt) {
		this.dungeon.update(dt);
		timer.update(dt);

		if (this.player.isDead) {
			stateMachine.change(GameStateName.Transition, {
				fromState: this,
				toState: stateMachine.states[GameStateName.GameOver]
			});
		}
	}

	render() {
		this.dungeon.render();
		this.userInterface.render();
	}
}
