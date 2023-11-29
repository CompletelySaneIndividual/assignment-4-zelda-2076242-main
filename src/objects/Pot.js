import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Tile from "../objects/Tile.js";
import Vector from "../../lib/Vector.js";
import GameObject from "./GameObject.js";
import Player from "../entities/Player.js"
import { context, DEBUG } from "../globals.js";
import Hitbox from "../../lib/Hitbox.js";
import Direction from "../enums/Direction.js";
import Animation from "../../lib/Animation.js";
import Room from "./Room.js"
import Timer from "../../lib/Timer.js";
import Enemy from "../entities/enemies/Enemy.js";
import Slime from "../entities/enemies/Slime.js";
import Skeleton from "../entities/enemies/Skeleton.js";

export default class Pot extends GameObject {
    static POT_WIDTH = Tile.TILE_SIZE;
	static POT_HEIGHT = Tile.TILE_SIZE;

    static CUT_POT_WIDTH = 2 * Tile.TILE_SIZE;
	static CUT_POT_HEIGHT = 2 * Tile.TILE_SIZE;

    static TOTAL_SPRITES = 4;
    static TOTAL_ROWS = 4;

    constructor(dimensions, position){
        super(dimensions, position);
        this.sprites = Pot.generateSprites();
        this.velocity = new Vector(0, 0);

        this.timer = new Timer();

        //2, 5, 8, 11
        this.isBreaking = false;
        this.animation = [new Animation([2, 2], 0.2), new Animation([2, 5, 8, 11], 0.2)];
        this.currentAnimation = this.animation[0];
        //this.frame = 11;
        this.isSolid = true;
        this.isCollidable = true;
        this.isBroken = false;
    }

    update(dt) { 
        this.currentAnimation.update(dt);
        this.timer.update(dt);
        //let tmp = new Vector(this.position.x, this.position.y);
        this.position.add(this.velocity, dt);

        if (this.position.y + this.dimensions.y >= Room.BOTTOM_EDGE) {
            this.position.y = Room.BOTTOM_EDGE - this.dimensions.y;
            this.velocity = new Vector(0, 0);
            this.break();
        }
        if (this.position.x + this.dimensions.x >= Room.RIGHT_EDGE) {
            this.position.x = Room.RIGHT_EDGE - this.dimensions.x;
            this.velocity = new Vector(0, 0);
            this.break();
        }
        if (this.position.y <= Room.TOP_EDGE - this.dimensions.y) {
            this.position.y = Room.TOP_EDGE - this.dimensions.y;
            this.velocity = new Vector(0, 0);
            this.break();
        }
        if (this.position.x <= Room.LEFT_EDGE) {
            this.position.x = Room.LEFT_EDGE;
            this.velocity = new Vector(0, 0);
            this.break();
        }

        this.hitbox.set(this.position.x, this.position.y + (0.5 * this.dimensions.y), this.dimensions.x, this.dimensions.y * 0.5);
    }
    
    render(offset = { x: 0, y: 0}) {
		const x = this.position.x + offset.x -0.5*Tile.TILE_SIZE;
		const y = this.position.y + offset.y -Tile.TILE_SIZE;

        if(!this.wasConsumed){
            this.sprites[this.currentAnimation.getCurrentFrame()].render(Math.floor(x), Math.floor(y));
            //this.sprites[this.frame].render(Math.floor(x), Math.floor(y));
        }

        if (DEBUG) {
			this.hitbox.render(context);
		}
	}

    static generateSprites() {
		const sprites = [];

		for (let x = 0; x < Pot.TOTAL_ROWS; x++) {
            for (let y = 0; y < Pot.TOTAL_SPRITES; y++){
                sprites.push(new Sprite(
                    images.get(ImageName.Pots),
                    x * Pot.CUT_POT_WIDTH,
                    y * Pot.CUT_POT_HEIGHT,
                    Pot.CUT_POT_WIDTH,
                    Pot.CUT_POT_HEIGHT
                ));
            }
		}

		return sprites;
	}

    highlight(){
        this.hitbox.colour = 'blue';
    }
    break(){
        if(! this.isBroken){
            this.isBroken = true;
            //console.log("Break Called");
            this.currentAnimation = this.animation[1];
            //console.log(this.currentAnimation)
            this.timer.addTask(() => {}, 0.1, 0.8, () => { this.wasConsumed = true; })
        }
    }

    onCollision(collider) {
		/**
		 * If this object is solid, then set the
		 * collider's position relative to this object.
		 */
		if (this.isSolid) {
			//console.log("Collision!" + this.isSolid)
			const collisionDirection = this.getEntityCollisionDirection(collider.hitbox);

			switch (collisionDirection) {
				case Direction.Up:
					collider.position.y = this.hitbox.position.y - Math.abs(collider.position.y - collider.hitbox.position.y) - collider.hitbox.dimensions.y;
					break;
				case Direction.Down:
					collider.position.y = this.hitbox.position.y + this.hitbox.dimensions.y - Math.abs(collider.position.y - collider.hitbox.position.y);
					break;
				case Direction.Left:
					collider.position.x = this.hitbox.position.x - Math.abs(collider.position.x - collider.hitbox.position.x) - collider.hitbox.dimensions.x;
					break;
				case Direction.Right:
					collider.position.x = this.hitbox.position.x + this.hitbox.dimensions.x - Math.abs(collider.position.x - collider.hitbox.position.x);
					break;
			}
		}

        

		if(this.isConsumable && !this.wasConsumed){
			this.onConsume(collider);
		}

		if (this.wasCollided) {
			return;
		}

		this.wasCollided = true;
	}
    onConsume(consumer) {
        //console.log("onConsume called")
        if(consumer instanceof Enemy || consumer instanceof Slime || consumer instanceof Skeleton){
            //console.log("consumed by enemy");
            this.velocity = new Vector(0, 0);
            this.break();
            consumer.receiveDamage(100);
            //this.wasConsumed = true;
        }
		
	}
}