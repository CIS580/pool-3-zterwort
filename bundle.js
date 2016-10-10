(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes */
const Game = require('./game');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var image = new Image();
image.src = 'assets/pool_balls.png';

var pockets = [
  {x: 0, y: 0},
  {x: 512, y: 0},
  {x: 1024, y: 0},
  {x: 0, y: 512},
  {x: 512, y: 512},
  {x: 1024, y: 512}
]
var stick = {x: 0, y: 0, power: 0, charge: false}
var balls = []
for(var i = 0; i < 18; i++){
  balls.push({
    position: {x: 0, y: 0},
    angle: 0,
    velocity: {x:0, y:0},
    color: 'gray',
    pocketed: false
  });
}
rack();

/**
 * Helper function to rack the balls
 */
function rack() {
  balls[15].position.x = 732;
  balls[15].position.y = 266;

  balls[0].position.x = 266;
  balls[0].position.y = 266;

  balls[1].position.x = 240;
  balls[1].position.y = 250;
  balls[8].position.x = 240;
  balls[8].position.y = 281;

  balls[9].position.x = 212;
  balls[9].position.y = 236;
  balls[7].position.x = 212;
  balls[7].position.y = 266;
  balls[2].position.x = 212;
  balls[2].position.y = 298;

  balls[3].position.x = 185;
  balls[3].position.y = 218;
  balls[10].position.x = 185;
  balls[10].position.y = 250;
  balls[4].position.x = 185;
  balls[4].position.y = 282;
  balls[11].position.x = 185;
  balls[11].position.y = 314;

  balls[12].position.x = 158;
  balls[12].position.y = 206;
  balls[5].position.x = 158;
  balls[5].position.y = 236;
  balls[13].position.x = 158;
  balls[13].position.y = 266;
  balls[6].position.x = 158;
  balls[6].position.y = 297;
  balls[14].position.x = 158;
  balls[14].position.y = 327;
}

/**
 * Track the changing stick position relative
 * to the cue ball.
 */
canvas.onmousemove = function(event) {
  event.preventDefault();
  stick.x = event.offsetX;
  stick.y = event.offsetY;
}

/**
 * Begin charging the stick
 */
canvas.onmousedown = function(event) {
  event.preventDefault();

  stick.power = 0;
  stick.charging = true;
}

/**
 * Strike the cue ball with the stick
 */
canvas.onmouseup = function(event) {
  var direction = {
    x: balls[15].position.x - stick.x,
    y: balls[15].position.y - stick.y
  }
  var denom = direction.x * direction.x + direction.y * direction.y;
  direction.x /= denom;
  direction.y /= denom;
  balls[15].velocity.x = stick.power * direction.x;
  balls[15].velocity.y = stick.power * direction.y;
  stick.charging = false;
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

  // charge cue stick
  if(stick.charging) {
    stick.power += 0.1 * elapsedTime;
  }

  // move balls
  balls.forEach(function(ball, index) {
    ball.position.x += elapsedTime * ball.velocity.x;
    ball.position.y += elapsedTime * ball.velocity.y;
    // bounce off bumpers
    if(ball.position.x < 15 || ball.position.x > 1009) {
      ball.velocity.x = -ball.velocity.x;
    }
    if(ball.position.y < 15 || ball.position.y > 497) {
      ball.velocity.y  = -ball.velocity.y;
    }
    // apply friction
    ball.velocity.x *= 0.999;
    ball.velocity.y *= 0.999;

    // check for pocket collisions
    pockets.forEach(function(pocket) {
      var distSq = Math.pow(ball.position.x - pocket.x, 2) +
                   Math.pow(ball.position.y - pocket.y, 2);
      if(distSq < 25 * 25) {
        if(index == 15) {
          // scratch
          ball.velocity.x = 0;
          ball.velocity.y = 0;
          ball.position.x = 732;
          ball.position.y = 266;
        } else {
          // ball in the pocket
          ball.pocketed = true;
          ball.velocity.x = 0;
          ball.velocity.y = 0;
          ball.position.x = -50;
        }
      }
    });
  });

  // check for ball collisions
  // TODO: Check for ball collisions
  // TODO: Process ball collisions
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  // Render the table
  ctx.fillStyle = "#3F6922";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render the pockets
  ctx.fillStyle = "#333333";
  pockets.forEach(function(pocket){
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, 25, 0, 2*Math.PI);
    ctx.fill();
  });

  // Render the balls
  balls.forEach(function(ball, index) {
    if(!ball.pocketed){
      var sourceX = index % 4;
      var sourceY = Math.floor(index / 4);
      ctx.save();
      ctx.translate(-15, -15);
      ctx.rotate(ball.angle);
      ctx.translate(ball.position.x, ball.position.y);
      ctx.drawImage(image,
        // Source Image
        sourceX * 160, sourceY * 160, 160, 160,
        // Destination Image
        0, 0, 30, 30
      );
      ctx.beginPath();
      ctx.strokeStyle = ball.color;
      ctx.arc(15,15,15,0,2*Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  });

  // Render the stick
  ctx.beginPath();
  ctx.moveTo(balls[15].position.x, balls[15].position.y);
  ctx.lineTo(stick.x, stick.y);
  if(stick.charging) {
    ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "darkgrey";
  }
  ctx.stroke();
  ctx.beginPath();
}

},{"./game":2}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}]},{},[1]);
