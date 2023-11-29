import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Tile from "../objects/Tile.js";
import Vector from "../../lib/Vector.js";
import GameObject from "./GameObject.js";
import Player from "../entities/Player.js"

export default class Heart extends GameObject {
    static HEART_WIDTH = Tile.TILE_SIZE;
	static HEART_HEIGHT = Tile.TILE_SIZE;
    constructor(dimensions, position){
        super(dimensions, position);
        this.sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Hearts),
			Heart.HEART_WIDTH,
			Heart.HEART_HEIGHT
		);
        
        this.isCollidable = true;
        this.isConsumable = true;
    }

    onConsume(consumer) {
        if(consumer instanceof Player && !this.wasConsumed){
            this.wasConsumed = true;
            console.log("Consumed By Player")
            consumer.receiveHealth(2);
        }
		
	}

    render() {
        if(!this.wasConsumed){
            this.sprites[4].render(this.position.x, this.position.y);
        }
	}
}