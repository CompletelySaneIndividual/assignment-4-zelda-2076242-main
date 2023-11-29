import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { keys } from "../../../globals.js";
import Pot from "../../../objects/Pot.js"
import Timer from "../../../../lib/Timer.js"
import Room from "../../../objects/Room.js";

export default class PlayerCarryWalkingState extends State {
    constructor(player) {
		super();

		this.timer = new Timer();
		this.player = player;

        this.pot = undefined;
		this.animation = {
			[Direction.Up]: new Animation([8, 9, 10, 11], 0.2),
			[Direction.Down]: new Animation([0, 1, 2, 3], 0.2),
			[Direction.Left]: new Animation([12, 13, 14, 15], 0.2),
			[Direction.Right]: new Animation([4, 5, 6, 7], 0.2),
		};
	}
    enter() {
		this.player.updatePot = true;
		this.player.sprites = this.player.carryingSprites;
		this.player.currentAnimation = this.animation[this.player.direction];
	}
	update(dt){
		this.handleMovement(dt);
	}
    handleMovement(dt) {
		this.player.currentAnimation = this.animation[this.player.direction];

		if (keys.s) {
			this.player.direction = Direction.Down;
			this.player.position.y += this.player.speed * dt;

			if (this.player.position.y + this.player.dimensions.y >= Room.BOTTOM_EDGE) {
				this.player.position.y = Room.BOTTOM_EDGE - this.player.dimensions.y;
			}
			this.updatePot();
		}
		else if (keys.d) {
			this.player.direction = Direction.Right;
			this.player.position.x += this.player.speed * dt;

			if (this.player.position.x + this.player.dimensions.x >= Room.RIGHT_EDGE) {
				this.player.position.x = Room.RIGHT_EDGE - this.player.dimensions.x;
			}
			this.updatePot();
		}
		else if (keys.w) {
			this.player.direction = Direction.Up;
			this.player.position.y -= this.player.speed * dt;

			if (this.player.position.y <= Room.TOP_EDGE - this.player.dimensions.y) {
				this.player.position.y = Room.TOP_EDGE - this.player.dimensions.y;
			}
			this.updatePot();
		}
		else if (keys.a) {
			this.player.direction = Direction.Left;
			this.player.position.x -= this.player.speed * dt;

			if (this.player.position.x <= Room.LEFT_EDGE) {
				this.player.position.x = Room.LEFT_EDGE;
			}
			this.updatePot();
		}
		else {
			this.player.updatePot = false;
			this.player.changeState(PlayerStateName.CarryingIdle);
		}
	}

	updatePot(){
		if(this.player.updatePot){
			console.log("updating pot")
			this.player.pot.position.x = this.player.position.x;
			this.player.pot.position.y = this.player.position.y;
		}
	}
}