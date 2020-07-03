class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create(){
        gameSettings.active = true;

        this.background = this.add.tileSprite(0,0,config.width,config.height,"background");
        this.background.setOrigin(0,0);
        
        var graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(config.width, 0);
        graphics.lineTo(config.width, 20);
        graphics.lineTo(0, 20);
        graphics.lineTo(0, 0);
        graphics.closePath();
        graphics.fillPath();

        this.score = 0;
        //var scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE 0", 16);
        this.livesLabel = this.add.bitmapText(210, 5, "pixelFont", "LIVES 3", 16);

        this.beamSound = this.sound.add("audio_beam");
        this.explosionSound = this.sound.add("audio_explosion");
        this.pickupSound = this.sound.add("audio_pickup");

        this.music = this.sound.add("music");

        var musicConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        this.music.play(musicConfig);

        this.ship1 = this.add.sprite(config.width/2 - 50 , -config.height/2, "ship");
        this.ship2 = this.add.sprite(config.width/2 , -config.height/2, "ship2");
        this.ship3 = this.add.sprite(config.width/2 + 50 , -config.height/2, "ship3");
        //this.ship1.setScale(2); for changing size
        //this.ship1.flipX(true); for flipping accross axis
        //this.ship1.angle += 3; for rotating clockwise
        //crazy image example: 
        //https://github.com/ansimuz/getting-started-with-phaser/tree/master/Part%203%20-%20Images%20Crazy%20Example
       
        this.enemies = this.physics.add.group();
            this.enemies.add(this.ship1);
            this.enemies.add(this.ship2);
            this.enemies.add(this.ship3);

        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        //this.input.on('gameobjectdown', this.destroyShip, this);//needed to be removed

        this.physics.world.setBoundsCollision();
        this.powerUps = this.physics.add.group();

        this.addpowerup();
        
        this.player = this.physics.add.sprite(config.width/2 - 8, config.height - 64, "player");
        this.player.play("thrust");

        this.player.setCollideWorldBounds(true);

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.projectiles = this.add.group();

        this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp){
            projectile.destroy();
        })

        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);

        this.physics.add.overlap(this.
            player, this.enemies, this.hurtPlayer, null, this);

        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);
            
    }

/*  zeroPad(number, size){
        var stringNumber = String(number);
        while(stringNumber.length < (size || 2)){
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }*/

    addpowerup(){
        for (var i = 0; i < gameSettings.maxPowerups; i++){
            var powerUp = this.physics.add.sprite(16, 16, "power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, game.config.width, game.config.height);

            if (Math.random() > 0.5) {
                powerUp.play("red");
            } else {
                powerUp.play("gray");
            }
            powerUp.setVelocity(gameSettings.powerUpVel, gameSettings.powerUpVel);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1);
        }
    }
    
    hitEnemy(projectile, enemy){

        var explosion = new Explosion(this, enemy.x, enemy.y);

        projectile.destroy();
        this.explosionSound.play();
        this.resetShipPos(enemy);
        if(enemy === this.ship1){
            this.score += 20
        } else if(enemy === this.ship2){
            this.score += 40
        } else if(enemy === this.ship3){
            this.score += 60
        };//improvisation
        //var scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + this.score;
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
        this.score += 150;
        //var scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + this.score;//scoreFormated
        //improvisation
        this.pickupSound.play();

        gameSettings.ship1Speed += 1
        gameSettings.ship2Speed += 1
        gameSettings.ship3Speed += 1

        this.time.addEvent({
            delay: 5000,
            callback: function(){
                gameSettings.ship1Speed -= 1
                gameSettings.ship2Speed -= 1
                gameSettings.ship3Speed -= 1
            },
            callbackScope: this,
            loop: false
        });
    }

    hurtPlayer(player, enemy){
        this.resetShipPos(enemy);

        this.score -= 300;
        //var scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + this.score; //scoreFormated
        //improvisation

        if (this.player.alpha < 1) {
            return;
        }

        var explosion = new Explosion(this, player.x, player.y);
        player.disableBody(true, true);

        if(gameSettings.lives === 0){
            //gameover
            console.log("GameOver")
            this.gameOver();
        } else {
            gameSettings.lives--;
            this.livesLabel.text = "LIVES " + gameSettings.lives;
        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        });
    }
    }

    resetPlayer(){
        var x = config.width / 2 - 8;
        var y = config.height + 64;
        this.player.enableBody(true, x, y, true, true);

        this.player.alpha = 0.5;

        var tween = this.tweens.add({
            targets: this.player,
            y: config.height - 64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function(){
                this.player.alpha = 1;
            },
            callbackScope: this
        })
    }
//this project was built while learning from youtube channel "luis Zuno", 
//all assets and procedure were acquired from there
    moveShip(ship, speed) {
        ship.y += speed;
        if(ship.y > config.height){
            if(gameSettings.active){
            this.score -= 10;
            //var scoreFormated = this.zeroPad(this.score, 6);
            this.scoreLabel.text = "SCORE " + this.score;}
            //improvisation
            this.resetShipPos(ship);
        }
    }

    resetShipPos(ship){
        ship.y = 0;
        var randomX = Phaser.Math.Between(0, config.width);
        ship.x = randomX;
    }
/*
    destroyShip(pointer, gameObject) {
        gameObject.setTexture("explosion");
        gameObject.play("explode");
    }
*/
    update(){
      
        this.moveShip(this.ship1, gameSettings.ship1Speed);
        this.moveShip(this.ship2, gameSettings.ship2Speed);
        this.moveShip(this.ship3, gameSettings.ship3Speed);

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)){
            if(this.player.active){
                this.shootBeam();
            }
        }

        for(var i = 0; i < this.projectiles.getChildren().length; i++){
          var beam = this.projectiles.getChildren()[i];
          beam.update();
        }
       
    }

    movePlayerManager(){

        this.player.setVelocity(0);

        if(this.cursorKeys.left.isDown){
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if(this.cursorKeys.right.isDown){
            this.player.setVelocityX(gameSettings.playerSpeed);
        }

        if(this.cursorKeys.up.isDown){
            this.player.setVelocityY(-gameSettings.playerSpeed);
          }else if(this.cursorKeys.down.isDown){
            this.player.setVelocityY(gameSettings.playerSpeed);
          }
    }

    shootBeam(){
        var beam = new Beam(this)
        this.beamSound.play();
    }

    gameOver(){
	    if(this.score < 0){
                this.add.text(30, 40, 'Your Score is Negative', { 
                fontSize: '15px', fill: '#faf5af'
            })
        } else {
            this.add.text(40, 40, 'Your Score is ' + this.score, { 
                fontSize: '15px', fill: '#faf5af'
            })
        }

	       
        this.add.text(40, 100, '\t\t\tGame Over\n\nClick on Screen\n To Play Again', { 
            fontSize: '20px', fill: '#ffe852'
        })
        
        gameSettings.active = false;
			this.input.on('pointerdown', () => {
				location.reload();
			})
    }
}
