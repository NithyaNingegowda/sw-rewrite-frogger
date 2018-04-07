const xPositions = [0, 101, 202, 303, 404];
const yPositions = [48, 131, 214];

// Enemies our player must avoid
const Enemy = class {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    constructor(){
        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = 'images/enemy-bug.png';
        this.x = -102;
        this.y = randomPosition(yPositions);
        this.speed = randomSpeed();
        this.width = 101;
    }
    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x = this.x + this.speed * dt;
        if(this.x > 600){
            this.x = -101;
            this.y = randomPosition(yPositions);
            this.speed = randomSpeed();
        }
        //handle collision
        this.checkCollision();  
    }

    // Draw the enemy on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    //Enemy and player are moving on the same y points
    //Check if they have collided on the x axis
    //player and enemy are 101 on width
    checkCollision() {
        if((this.y == player.y) && (((player.x) < this.x + 80))&&(player.x + player.width > this.x)){
        //bring player to original position
        player.decreaseLife();
        player.resetPlayer();
        }
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
const Player = class{
    constructor() {
        this.sprite = 'images/char-boy.png';
        this.resetPlayer();
        this.width = 101;
        this.score = 0;
        this.life = 3;
        this.movingDirection = 'none';
    }

    //handles the user input and moves the player on the screen
    handleInput(key) {
        this.movingDirection = key;
        switch(key) {
        case 'up': 
            player.y -= 83;
            break;
        case 'down':
            player.y += 83;
            break;
        case 'left':
            player.x -= 101;
            break;
        case 'right':
            player.x += 101;
            break;
        default:
        }
    }

    //update the player position and make sure it doesn't go
    //outside of the rendering box
    update() {
        if(this.y < 1){
            //the player made it
            this.resetPlayer();
            this.raiseScore();
            //this.resetEnvironment();
        }
        
        if(this.y > 380){
            this.y = 380;
        }
        
        if(this.x < -2){
            this.x = -2;
        }
        
        if(this.x > 402){
            this.x = 402;
        }
        //no more lives
        //game over
        if(this.life === 0){
            //implement a game over
            // Get the <span> element for final score
            var scores = document.getElementsByClassName("final-score");
            for(let i = 0; i < scores.length ;i++){
                scores[i].innerHTML = player.score;
            }

            // Get the modal
            var modal = document.getElementById('myModal');
            // Display modal
            modal.style.display = "block";

            this.score = 0;
            this.life = 3;

            // Get the <span> element that closes the modal
            var spanClose = document.getElementsByClassName("close")[0];

            // When the user clicks on <span> (x), close the modal
            spanClose.onclick = function() {
                modal.style.display = "none";
                location.reload();
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    location.reload();
                }
            }

        }
    }

    // Draw the player on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.font = '24PT Impact';
        ctx.fillText(`Score: ${this.score}`, 10, 90);
        ctx.fillText(`Lives: ${this.life}`, 10, 580);
    }

    //Bring player to original position
    resetPlayer() {
        this.y = 380;
        this.x = 200;
    }

    //Raise the score
    raiseScore() {
        this.score += 100;
    }

    //decrease life
    decreaseLife(){
        this.life--;
    }

    //increase life
    increaseLife(){
        this.life++;
    }
};

//Class Gem
const Gem = class{
    constructor(){
        this.sprite = 'images/Gem-Blue.png';
        this.x = randomPosition(xPositions);
        this.y = randomPosition(yPositions);
        this.width = 101;
    }

    update(){
        this.collectGem();
        this.checkObstacles();
        this.checkLifePosition();
    }

    // Draw the Gem on the screen
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    //allow the player to collect the gem
    collectGem(){
        if((this.y == player.y) && (((player.x) < this.x + 80))&&(player.x + player.width > this.x)){
            //make gem disappear
            this.x = -1000;
            this.y = -1000;

            //increase score by 20 points
            player.score += 20;
        }
    }

    //make sure the gem doesn't fall on the same position as the obstacle
    checkObstacles(){
        for(const obstacle of allObstacles){
            if(this.x == obstacle.x && this.y == obstacle.y){
            //If gem lies in the same position as rock, move gem
            this.x = randomPosition(xPositions);
            this.y = randomPosition(yPositions);
            }
        }
    }

    //make sure the gem doesn't fall on the same position as the obstacle
    checkLifePosition(){
        if(this.x == life.x && this.y == life.y){
            //If gem lies on the same position as life, move gem
            this.x = randomPosition(xPositions);
            this.y = randomPosition(yPositions);
        }
    }
};


//Class Obstacle
const Obstacle = class{
    constructor(){
        this.sprite = 'images/Rock.png';
        this.x = randomPosition(xPositions);
        this.y = randomPosition(yPositions);
        this.width = 101;
    }

    update(){
        this.obstruct();
    }

    // Draw the obstacle on the screen
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    //don't let the user pass over the rock
    obstruct(){

        if((this.y == player.y) && (((player.x) < this.x + 80))&&(player.x + player.width > this.x)){
            switch(player.movingDirection) {
            case 'up': 
                player.y += 83;
                break;
            case 'down':
                player.y -= 83;
                break;
            case 'left':
                player.x += 101;
                break;
            case 'right':
                player.x -= 101;
                break;
            default:
            }
        }
    }

}

const Life = class{
     constructor() {
        this.sprite = 'images/Heart.png';
        this.x = randomPosition(xPositions);
        this.y = randomPosition(yPositions);
        
     }
     render (){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
     }
     update(){
         this.collectLife();
         this.checkObstacles();
     }

     collectLife(){
        if((this.y == player.y) && (((player.x) < this.x + 80))&&(player.x + player.width > this.x)){
            //make Life disappear
            this.x = -1000;
            this.y = -1000;

            //increase score by 30 points
            //increase life by 1
            player.score += 30;
            player.life++;

            //make life reappear in 5 seconds
            //setTimeout(function() { reset(); }, 5000);
        }
    }

    //make sure the life doesn't fall on the same position as the obstacle
    checkObstacles(){
        for(const obstacle of allObstacles){
            if(this.x == obstacle.x && this.y == obstacle.y){
            //If life lies in the same position as rock, move life
            this.x = randomPosition(xPositions);
            this.y = randomPosition(yPositions);
            }
        }
    }

    reset(){
        this.x = randomPosition(xPositions);
        this.y = randomPosition(yPositions);
    }

 };

//create gems
const allGems = [];
allGems[0] = new Gem;

//create rocks
const allObstacles = [];
allObstacles[0] = new Obstacle;
allObstacles[1] = new Obstacle;

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
const allEnemies = []; 
const numEnemies = 3;

for(let i = 0; i < numEnemies; i++){
    allEnemies[i] = new Enemy;
    allEnemies[i].speed = randomSpeed(); 
    allEnemies[i].y = randomPosition(yPositions);
}
// Place the player object in a variable called player
const player = new Player;
const life = new Life;
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', e => {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

//this function takes an array and a number of items you want to return
//https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array
function getRandom(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


//get a random speed
function randomSpeed(){
    const speed = Math.floor(Math.random() * (400 - 100) + 100); 
    return speed;
}

//get a random y position for enemy
function randomPosition(arr = []){
    positions = arr;
    const position = getRandom(positions, 1);
    return position[0];
}
