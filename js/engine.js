/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        start = false,
        gameOver = false,
        timeMS = 0,
        timeS = 0,
        timeM = 0,
        timeH = 0;

    var canv = document.getElementById('canvas');

    canvas.width = 505;
    canvas.height = 606;
    canv.firstChild.appendChild(canvas);
    ctx.font = "20pt Impact";
    ctx.textAling = "center";

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        //check if player lose all his lives
        gameOver = player.lose(false);

        if(start){
          /* Use the browser's requestAnimationFrame function to call this
           * function again as soon as the browser is able to draw another frame.
           */
            win.requestAnimationFrame(main);
        }

        // if gameOver is true, stop the game
        if (gameOver) {
            start = false;
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        paintAreaGame();
        renderEntities();
        paintPlayerInfo();
        paintTime();
        gem.putGems(timeS, timeMS);
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();

        gem.render();

        rocksArray.forEach(function(rock) {
            rock.render();
        });
    }

    /* This function is called by the render function and is called on each game
     * tick, that makes the time illusion posible, this function paints the time
     * in the screen.
     */
    function paintTime() {
        if (timeMS === 60) {//increase Seconds
            timeMS = 0;
            timeS++;
        }else if (timeS === 60) {//increase Minutes
            timeS = 0;
            timeM++;
        }else if (timeM === 60) {//increase Hours
            timeM = 0;
            timeH++;
        }
        var timeText = 'Time: ';
        timeText += timeH + ':' + timeM + ':' + timeS;
        getText(timeText, 10, 580);
        timeMS++;
    }

    // This function draws the area of the game
    function paintAreaGame() {
      /* This array holds the relative URL to the image used
       * for that particular row of the game level.
       */
      var rowImages = [
              'images/water-block.png',   // Top row is water
              'images/stone-block.png',   // Row 1 of 3 of stone
              'images/stone-block.png',   // Row 2 of 3 of stone
              'images/stone-block.png',   // Row 3 of 3 of stone
              'images/grass-block.png',   // Row 1 of 2 of grass
              'images/grass-block.png'    // Row 2 of 2 of grass
          ],
          numRows = 6,
          numCols = 5,
          row, col;
      /* Loop through the number of rows and columns we've defined above
       * and, using the rowImages array, draw the correct image for that
       * portion of the "grid"
       */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (row = 0; row < numRows; row++) {
          for (col = 0; col < numCols; col++) {
              /* The drawImage function of the canvas' context element
               * requires 3 parameters: the image to draw, the x coordinate
               * to start drawing and the y coordinate to start drawing.
               * We're using our Resources helpers to refer to our images
               * so that we get the benefits of caching these images, since
               * we're using them over and over.
               */
              ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
          }
      }
    }

    //This function draws the players information at the top of the screen
    function paintPlayerInfo() {
        for (var i = 0; i < player.lives; i++) {
            if (i === 0) {
                ctx.drawImage(Resources.get('images/heart.png'), 0, 0);
            }else {
                ctx.drawImage(Resources.get('images/heart.png'), 51*i, 0);
            }
        }

        var strX = "x";
        ctx.drawImage(Resources.get('images/gem-blue-top.png'), 275, 0);
        getText(strX + player.blue, 310, 30);
        ctx.drawImage(Resources.get('images/gem-green-top.png'), 350, 0);
        getText(strX + player.green, 385, 30);
        ctx.drawImage(Resources.get('images/gem-orange-top.png'), 425, 0);
        getText(strX + player.orange, 460, 30);
    }

    // Draws the given text on the position x, y
    function getText(text, x, y) {
      ctx.fillStyle = "white";
      ctx.fillText(text, x, y);

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeText(text, x, y);
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        player = new Player();

        allEnemies.forEach(function(enemy) {
            enemy = new Enemy();
        });
        rocksArray.length = 0;
        timeMS = 0;
        timeS = 0;
        timeM = 0;
        timeH = 0;
        render();
        start = false;
    }

    //checks posible collision between player and enemies
    function checkCollisions(){
        for (var i = 0; i < allEnemies.length; i++) {
            if ((allEnemies[i].x) <= player.x + 30 &&
                (allEnemies[i].x + 30) >= (player.x) &&
                (allEnemies[i].y)<= player.y + 30 &&
                (allEnemies[i].y + 30) >= (player.y)) {
                  player.lose(true);
            }
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/gem-blue-top.png',
        'images/gem-green-top.png',
        'images/gem-orange-top.png',
        'images/gem-blue.png',
        'images/gem-green.png',
        'images/gem-orange.png',
        'images/heart.png',
        'images/rock.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    // This listens for start icon from the screen and starts the game
    $('#start').click(function() {
        start = true;
        if (player.lives === 0) {
            reset();
        }
        win.requestAnimationFrame(main);
    });

    // This listens for reset icon from the screen and start over the game
    $('#reset').click(function() {
        reset();
    });

})(this);
