import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { keys } from "../../../globals.js";
import Pot from "../../../objects/Pot.js"
import Timer from "../../../../lib/Timer.js"

export default class PlayerLiftingState extends State {
	static MAX_DISTANCE_FROM_POT = 6;
	static PLAYER;
    constructor(player) {
		super();

		this.timer = new Timer();
		this.player = player;
		this.animation = {
			[Direction.Up]: new Animation([6, 7, 8], 0.2),
			[Direction.Down]: new Animation([0, 1, 2], 0.2),
			[Direction.Left]: new Animation([9, 10, 11], 0.2),
			[Direction.Right]: new Animation([3, 4, 5], 0.2),
		};
	}

    enter() {
		let objects = Player.DUNGEON.currentRoom.objects;

		let smallestDistance = Number.MAX_VALUE;
		let closestPotIndex = 0;
		for(let i = 0; i <objects.length; i++) {
			if(objects[i].constructor.name === "Pot" ){//&& !objects[i].wasConsumed
				let distance = this.calculateDistance(this.player.position, objects[i].position);
				
				if(distance <= smallestDistance){
					smallestDistance = distance;
					closestPotIndex = i;
				}
			}
		}

		if(smallestDistance <= PlayerLiftingState.MAX_DISTANCE_FROM_POT){
			//console.log("entered");
			let pot = Player.DUNGEON.currentRoom.objects[closestPotIndex];
			pot.highlight();
			
			let newX = this.player.position.x;
			let newY = this.player.position.y;

			pot.isSolid = false;

			this.player.pot = pot;//pass the pot through the player
			this.player.updatePot = true;

			this.timer.tween(pot.position, ['x', 'y'], [newX, newY], 0.4, () => {
					//console.log("going to Carrying state");
					this.player.changeState(PlayerStateName.Carrying);
				});

			this.player.sprites = this.player.liftingSprites;
			this.player.currentAnimation = this.animation[this.player.direction];
		}else{
			//console.log("going to Idle state");
			this.player.changeState(PlayerStateName.Idle);
		}		
	}
	update(dt){
		this.timer.update(dt);
	}

	calculateDistance(position1, position2) {
		return Math.sqrt(Math.abs(((position2.x - position1.x)^2) + ((position2.y - position1.y)^2)));  
	}
}