var gameSettings = {
    playerSpeed: 200,
    maxPowerups: 4,
    powerUpVel: 50,
    ship1Speed: 1,
    ship2Speed: 2,
    ship3Speed: 3,
    lives: 3,
}

var config = {
    width: 256,
    height: 272,
    backgroundColor: 0x000000,
    scene: [Scene1, Scene2],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade:{
            debug: false
        }
    }
}

    var game = new Phaser.Game(config);