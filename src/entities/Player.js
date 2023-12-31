import GameEntity from "./GameEntity.js";
import { context, DEBUG, images, sounds, timer } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/entity/player/PlayerWalkingState.js";
import PlayerSwordSwingingState from "../states/entity/player/PlayerSwordSwingingState.js";
import PlayerIdlingState from "../states/entity/player/PlayerIdlingState.js";
import PlayerLiftingState from "../states/entity/player/PlayerLiftingState.js";
import PlayerCarryWalkingState from "../states/entity/player/PlayerCarryWalkingState.js";
import PlayerCarryIdleState from "../states/entity/player/PlayerCarryingIdleState.js";
import PlayerThrowingState from "../states/entity/player/PlayerThrowingState.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import Hitbox from "../../lib/Hitbox.js";
import ImageName from "../enums/ImageName.js";
import Sprite from "../../lib/Sprite.js";
import Room from "../objects/Room.js";
import Direction from "../enums/Direction.js";
import SoundName from "../enums/SoundName.js";

export default class Player extends GameEntity {
	static WIDTH = 16;
	static HEIGHT = 22;
	static WALKING_SPRITE_WIDTH = 16;
	static WALKING_SPRITE_HEIGHT = 32;
	static SWORD_SWINGING_SPRITE_WIDTH = 32;
	static SWORD_SWINGING_SPRITE_HEIGHT = 32;
	static LIFTING_SPRITE_WIDTH = 16;
	static LIFTING_SPRITE_HEIGHT = 32;
	static CARRYING_SPRITE_WIDTH = 16;
	static CARRYING_SPRITE_HEIGHT = 32;
	static INVULNERABLE_DURATION = 1.5;
	static INVULNERABLE_FLASH_INTERVAL = 0.1;
	static MAX_SPEED = 100;
	static MAX_HEALTH = 6;
	static DUNGEON;

	/**
	 * The hero character the player controls in the map.
	 * Has the ability to swing a sword to kill enemies
	 * and will collide into objects that are collidable.
	 */
	constructor() {
		super();

		this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.PlayerWalk),
			Player.WALKING_SPRITE_WIDTH,
			Player.WALKING_SPRITE_HEIGHT
		);
		this.swordSwingingSprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.PlayerSword),
			Player.SWORD_SWINGING_SPRITE_WIDTH,
			Player.SWORD_SWINGING_SPRITE_HEIGHT
		);
		this.liftingSprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Lifting),
			Player.LIFTING_SPRITE_WIDTH,
			Player.LIFTING_SPRITE_HEIGHT
		);
		this.carryingSprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Carrying),
			Player.CARRYING_SPRITE_WIDTH,
			Player.CARRYING_SPRITE_HEIGHT
		);
		this.sprites = this.walkingSprites;

		/**
		 * Since the regular sprite and sword-swinging sprite are different dimensions,
		 * we need a position offset to make it look like one smooth animation when rendering.
		 */
		this.positionOffset = { x: 0, y: 0 };

		/**
		 * Start the sword's hitbox as nothing for now. Later, in the
		 * PlayerSwordSwingingState, we'll define the actual dimensions.
		 */
		this.swordHitbox = new Hitbox(0, 0, 0, 0, 'blue');

		/**
		 * We don't want the hitbox for the player to be the size of the
		 * whole sprite. Instead, we want a much smaller area relative to
		 * the player's dimensions and position to be used to detect collisions.
		 */
		this.hitboxOffsets = new Hitbox(0, Player.HEIGHT, 0, -Player.HEIGHT + 6);
		this.position.x = Room.CENTER_X - Player.WIDTH / 2;
		this.position.y = Room.CENTER_Y - Player.HEIGHT / 2;
		this.dimensions.x = Player.WIDTH;
		this.dimensions.y = Player.HEIGHT;
		this.speed = Player.MAX_SPEED;
		this.totalHealth = Player.MAX_HEALTH;
		this.health = Player.MAX_HEALTH;
		this.isInvulnerable = false;
		this.alpha = 1;
		this.invulnerabilityTimer = null;
		this.stateMachine = this.initializeStateMachine();
		this.isUnmovable = false;
		this.setx = this.position.x;
		this.sety = this.position.y;
	}

	render() {
		context.save();

		context.globalAlpha = this.alpha;

		super.render(this.positionOffset);

		context.restore();

		if (DEBUG) {
			this.swordHitbox.render(context);
		}
	}

	reset() {
		this.position.x = Room.CENTER_X - Player.WIDTH / 2;
		this.position.y = Room.CENTER_Y - Player.HEIGHT / 2
		this.health = Player.MAX_HEALTH;
		this.isDead = false;
		this.isInvulnerable = false;
		this.alpha = 1;
		this.invulnerabilityTimer?.clear();
		this.direction = Direction.Down;
		this.stateMachine.change(PlayerStateName.Idle);
	}

	initializeStateMachine() {
		const stateMachine = new StateMachine();

		stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
		stateMachine.add(PlayerStateName.SwordSwinging, new PlayerSwordSwingingState(this));
		stateMachine.add(PlayerStateName.Idle, new PlayerIdlingState(this));
		stateMachine.add(PlayerStateName.Lifting, new PlayerLiftingState(this));
		stateMachine.add(PlayerStateName.Carrying, new PlayerCarryWalkingState(this));
		stateMachine.add(PlayerStateName.CarryingIdle, new PlayerCarryIdleState(this));
		stateMachine.add(PlayerStateName.Throwing, new PlayerThrowingState(this));

		stateMachine.change(PlayerStateName.Idle);

		return stateMachine;
	}

	receiveDamage(damage) {
		this.health -= damage;
		sounds.play(SoundName.HitPlayer);
	}

	receiveHealth(health) {
		this.health += health;
		if (this.health > Player.MAX_HEALTH){
			this.health = Player.MAX_HEALTH;
		}
		//sounds.play(SoundName.);
	}

	becomeInvulnerable() {
		this.isInvulnerable = true;
		this.invulnerabilityTimer = this.startInvulnerabilityTimer();
	}

	startInvulnerabilityTimer() {
		const action = () => {
			this.alpha = this.alpha === 1 ? 0.5 : 1;
		};
		const interval = Player.INVULNERABLE_FLASH_INTERVAL;
		const duration = Player.INVULNERABLE_DURATION;
		const callback = () => {
			this.alpha = 1;
			this.isInvulnerable = false;
		};

		return timer.addTask(action, interval, duration, callback);
	}
}
