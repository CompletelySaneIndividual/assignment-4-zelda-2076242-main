import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { keys } from "../../../globals.js";
import Pot from "../../../objects/Pot.js"
import Timer from "../../../../lib/Timer.js";
import Vector from "../../../../lib/Vector.js";

export default class PlayerThrowingState extends State {
    static MAX_THROW_DISTANCE = 75;
	static PLAYER;
    constructor(player) {
		super();

		this.timer = new Timer();
		this.player = player;
		this.animation = {
			[Direction.Up]: new Animation([8, 7, 6], 0.2),
			[Direction.Down]: new Animation([2, 1, 0], 0.2),
			[Direction.Left]: new Animation([11, 10, 9], 0.2),
			[Direction.Right]: new Animation([5, 4, 3], 0.2),
		};
	}

    enter() {
        //console.log("Entered throwing state!");
        this.pot = this.player.pot;

        let newX = this.player.position.x;
        let newY = this.player.position.y;

        switch (this.player.direction) {
            case Direction.Up: 
                // newX = this.player.position.x;
                // newY = this.player.position.y - PlayerThrowingState.MAX_THROW_DISTANCE;
                this.player.pot.velocity.y = - PlayerThrowingState.MAX_THROW_DISTANCE;
                break;
            case Direction.Down:
                // newX = this.player.position.x;
                // newY = this.player.position.y + PlayerThrowingState.MAX_THROW_DISTANCE;
                this.player.pot.velocity.y = PlayerThrowingState.MAX_THROW_DISTANCE;
                break;
            case Direction.Right:
                // newX = this.player.position.x + PlayerThrowingState.MAX_THROW_DISTANCE;
                // newY = this.player.position.y;
                this.player.pot.velocity.x = PlayerThrowingState.MAX_THROW_DISTANCE;
                break;
            case Direction.Left:
                // newX = this.player.position.x - PlayerThrowingState.MAX_THROW_DISTANCE;
                // newY = this.player.position.y;
                this.player.pot.velocity.x = - PlayerThrowingState.MAX_THROW_DISTANCE;
                break;
        }
        //

        this.pot.isSolid = false;
        this.pot.isCollidable = true;
        this.pot.isConsumable = true;

        this.player.updatePot = false;

        // this.timer.tween(this.pot.position, ['x', 'y'], [newX, newY], 0.4, () => {
        //     //console.log("going to Idle state");
        //     this.player.changeState(PlayerStateName.Idle);
        // });
        this.timer.tween(this.player.position, ['x', 'y'], [newX, newY], 0.4, () => {
                //console.log("going to Idle state");
                this.player.changeState(PlayerStateName.Idle);
            });
        

        this.player.sprites = this.player.liftingSprites;
        this.player.currentAnimation = this.animation[this.player.direction];		
        console.log(this.player.pot)
	}
	update(dt){
		this.timer.update(dt);
	}
}