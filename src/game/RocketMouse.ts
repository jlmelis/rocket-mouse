import Phaser, { Physics } from 'phaser';
import TextureKeys from '../consts/TextureKeys';
import AnimationKeys from '../consts/AnimationKeys';
import SceneKeys from '../consts/SceneKeys';

enum MouseSate {
    Running,
    Killed,
    Dead
}

export default class RocketMouse extends Phaser.GameObjects.Container {
    private mouseState = MouseSate.Running;
    private flying = false;

    private flames: Phaser.GameObjects.Sprite;
    private mouse: Phaser.GameObjects.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.mouse = scene.add.sprite(0, 0, TextureKeys.RocketMouse)
            .setOrigin(0.5, 1)
            .play(AnimationKeys.RocketMouseRun);

        this.flames = scene.add.sprite(-63, -15, TextureKeys.RocketMouse)
            .play(AnimationKeys.RocketFlamesOn);
        this.enableJetpack(false);

        this.add(this.flames);
        this.add(this.mouse);


        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.mouse.width, this.mouse.height);
        body.setOffset(this.mouse.width * -0.5, -this.mouse.height);

        this.cursors = scene.input.keyboard.createCursorKeys();
        

        // does this make sense here or on the game?
        var shape = new Phaser.Geom.Rectangle(
            this.mouse.width * -0.5, 
            -this.mouse.height, 
            this.mouse.width, 
            this.mouse.height
        );
        
        this.setInteractive(shape, Phaser.Geom.Rectangle.Contains);

        let thisContainer = this;
        thisContainer.on('pointerover', function () {
            console.log('rocket mouse clicked')
            thisContainer.flying = true;
        });

        thisContainer.on('pointerout', function () {
            console.log('rocket mouse lifted')
            thisContainer.flying = false;
        });
    }
    

    preUpdate() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.mouse.width * 0.5, this.mouse.height * 0.7);
        body.setOffset(this.mouse.width * -0.3, -this.mouse.height + 15);

         switch (this.mouseState) {
            
            case MouseSate.Running: {
                
                
                if (this.cursors.space?.isDown || this.flying) {
                    body.setAccelerationY(-600);
                    this.enableJetpack(true);
        
                    this.mouse.play(AnimationKeys.RocketMouseRunFly, true);
                }
                else {
                    body.setAccelerationY(0);
                    this.enableJetpack(false);
                }
        
                if (body.blocked.down) {
                    this.mouse.play(AnimationKeys.RocketMouseRun, true);
                }
                else if (body.velocity.y > 0) {
                    this.mouse.play(AnimationKeys.RocketMouseRunFall, true);
                }

                break;
            }

            case MouseSate.Killed: {
                body.velocity.x *= 0.99;

                if (body.velocity.x <= 5) {
                    this.mouseState = MouseSate.Dead
                }
                break;
            }

            case MouseSate.Dead: {
                body.setVelocity(0, 0);

                this.scene.scene.run(SceneKeys.GameOver);
                break;
            }
        }


    }

    enableJetpack(enabled: boolean) {
        this.flames.setVisible(enabled);
    }

    kill() {
        if (this.mouseState !== MouseSate.Running) {
            return;
        }

        this.mouseState = MouseSate.Killed;

        this.mouse.play(AnimationKeys.RocketMouseDead);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAccelerationY(0);
        body.setVelocity(1000, 0);
        this.enableJetpack(false);
    }
}