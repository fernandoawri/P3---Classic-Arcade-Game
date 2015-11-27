// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    this.y = 224;
    this.speed = 1;
};
// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Set the enemy speed
Enemy.prototype.setSpeed = function() {
    this.speed = Math.floor(Math.random() * (300 - 80)) + 80;
};

Enemy.prototype.avoidCollision = function(){
    // Get every possible pair of enemies in an array.
    var enemyPairArray = [];
    for (var i = 0; i < allEnemies.length; i++) {
        for (var j = i + 1; j < allEnemies.length; j++) {
            arr = new Array(allEnemies[i], allEnemies[j]);
            enemyPairArray.push(arr);
        }
    }
    enemyPairArray.forEach(function(pair) {
    // Checking collision of each pair
    // To hold two enemies.
        var e1 = pair[0];
        var e2 = pair[1];
        if (e1.x < e2.x + 80 && e1.x + 80 > e2.x &&
            e1.y < e2.y + 83 && e1.y + 83 > e2.y) {
            e1.speed = e2.speed;
        }
    });//End forEach
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + this.speed * dt;
    if (this.x > 500) {
        this.x = 0;
        this.setSpeed();
    }
    this.avoidCollision();
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(){
    this.sprite = 'images/char-boy.png';
    this.x = 202;
    this.y = 400;
    this.lives = 5;
    this.green = 0;
    this.blue = 0;
    this.orange = 0;
};

Player.prototype.collect = function() {
    if(gem.active){
        var auxgy = 0;
        if (gem.y === 60) {
            auxgy = 72;
        }else if (gem.y === 143) {
            auxgy = 154;
        }else if (gem.y === 226) {
            auxgy = 236;
        }
        if (this.x === gem.x && this.y === auxgy) {
            if (gem.sprite === 'images/gem-blue.png') {
                this.blue++;
            }else if (gem.sprite === 'images/gem-green.png') {
                this.green++;
            }else if (gem.sprite === 'images/gem-orange.png') {
                this.orange++;
            }
            gem.update(false);
        }
    }
};

// Update checks the player position
// then calls collect() to pick gems
Player.prototype.update = function() {
    this.lose(false);
    this.collect();
};

// lose the player loses for different reasons
// reachs the water or a conllosion with an enemy
Player.prototype.lose = function(lose) {
    //player reached the water
    if(this.y === -10){
        this.x = 202;
        this.y = 400;
        this.lives--;
    }// Else, if lose is true, player reached an enemy
    else if (lose) {
        this.x = 202;
        this.y = 400;
        this.lives--;
    }
    // Prints "You lose" if player has 0 lives
    if (this.lives === 0) {
        ctx.fillStyle = 'white';
        ctx.fillText('You lose', 200, 300);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText('You lose', 200, 300);
        return true;
    }
    return false;
};

// Draw the player on the screen, required method for game
// then calls lose() to check lives and lose position
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Draw the player on the screen with the new selected image
Player.prototype.changePlayer = function(newPlayer) {
    this.sprite = newPlayer;
    this.render();
};

// Check whether there is a rock in the next position
// returns true if the next position is clear
Player.prototype.checkRock = function(rocksArray, x, y) {
    for (var i = 0; i < rocksArray.length; i++) {
        var auxgy = 0;
        if (rocksArray[i].y === 60) {
            auxgy = 72;
        }else if (rocksArray[i].y === 143) {
            auxgy = 154;
        }else if (rocksArray[i].y === 226) {
            auxgy = 236;
        }
        if(rocksArray[i].x === x && auxgy === y){
            return false;
        }
    }

    return true;
};

// handleInput moves the player's position, required method for game
// Parameter: string, a string with the next move
Player.prototype.handleInput = function(allowedKeys, rocksArray) {
    if(allowedKeys === 'left' && this.x > 0){
        if (this.checkRock(rocksArray, this.x - 101, this.y)) {
            this.x = this.x - 101;
        }
    }else if (allowedKeys === 'up'  && this.y >= 72) {
        if (this.checkRock(rocksArray, this.x, this.y - 82)) {
            this.y = this.y - 82;
        }
    }else if (allowedKeys === 'right' && this.x < 404) {
      if (this.checkRock(rocksArray, this.x + 101, this.y)) {
          this.x = this.x + 101;
      }
    }else if (allowedKeys === 'down'  && this.y < 400) {
      if (this.checkRock(rocksArray, this.x, this.y + 82)) {
          this.y = this.y + 82;
      }
    }
};

// postionsY keeps the Y position for enemies, gems and rocks
var postionsY = [60, 143, 226];

// postionsX keeps the X position for enemies, gems and rocks
var postionsX = [101, 202, 303, 404];

// postionsY keeps the posible colors for gems
var gems = ['images/gem-blue.png', 'images/gem-green.png', 'images/gem-orange.png'];

// Now write your own gem class
// This class requires an update() and render()
var Gem = function () {
    this.x = postionsX[Math.floor(Math.random() * 4)];
    this.y = postionsY[Math.floor(Math.random() * 3)];
    this.sprite = gems[Math.floor(Math.random() * 3)];
    this.active = true;
};

// Draw the gem on the screen
Gem.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Update checks whether the gem is active or not
// then draws a new gem or change the position
// of the gem in the screen if the input show is true
Gem.prototype.update = function(show) {
    this.active = show;
    if (show) {
        this.x = postionsX[Math.floor(Math.random() * 4)];
        this.y = postionsY[Math.floor(Math.random() * 3)];
        this.sprite = gems[Math.floor(Math.random() * 3)];
    }else {
        this.x = 600;
        this.y = 700;
    }
};

// puts a gem every 7 seconds ramdomly on the screen
Gem.prototype.putGems = function (timeS, timeMS) {
    if (timeS > 0 && timeS % 7 === 0 && timeMS === 1) {
        gem.update(true);
    }
};

// Now write your own rock class
// This class requires a render()
var Rock = function () {
    this.x = postionsX[Math.floor(Math.random() * 4)];
    this.y = postionsY[Math.floor(Math.random() * 3)];
    this.sprite = 'images/rock.png';
};

// Draw the rock on the screen
Rock.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now instantiate your objects.
var player = new Player();
var gem = new Gem();
var allEnemies = new Array();
var rocksArray = new Array();

// Place all enemy objects in an array called allEnemies
for (var i = 0; i < 3; i++) {
    var bugEnemy = new Enemy();
    bugEnemy.x = 0;
    bugEnemy.y = postionsY[i];
    bugEnemy.setSpeed();
    allEnemies.push(bugEnemy);
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    // e contains the pressed key
    player.handleInput(allowedKeys[e.keyCode], rocksArray);
});

// This listens for boy icon from the screen and changes the player image
$('#boy').click(function() {
    player.changePlayer('images/char-boy.png');
});

// This listens for catgirl icon from the screen and changes the player image
$('#catgirl').click(function() {
    player.changePlayer('images/char-cat-girl.png');
});

// This listens for horngirl icon from the screen and changes the player image
$('#horngirl').click(function() {
    player.changePlayer('images/char-horn-girl.png');
});

// This listens for pinkgirl icon from the screen and changes the player image
$('#pinkgirl').click(function() {
    player.changePlayer('images/char-pink-girl.png');
});

// This listens for princess icon from the screen and changes the player image
$('#princess').click(function() {
    player.changePlayer('images/char-princess-girl.png');
});

// This listens for rock icon from the screen and adds one rock
$('#rock').click(function() {
    rocksArray.push(new Rock());
});
