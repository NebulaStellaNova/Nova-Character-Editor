var objects = [];
function add(obj) {
    objects.push(obj);
}


// -- Constructors -- \\
function NovaAnimation(name, path, fps, loop) {
    this.name = name;
    this.path = path;
    this.fps = fps;
    this.loop = loop;
}

function NovaPoint(x, y) {
    this.x = x;
    this.y = y;
    this.set = function(x, y) {
        this.x = x;
        this.y = y;
    }
}
function NovaRect(width, height) {
    this.width = width;
    this.height = height;
    this.set = function(width, y) {
        this.width = width;
        this.height = height;
    }
}
function NovaSprite(x, y, src) {
    this.type = "NovaSprite";

    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.scale = new NovaPoint(1, 1);
    this.src = "./images/" + src + ".png";
    this.animations = [];
    this.xml = "";
    this.curAnimName = "";
    this.curAnimFrame = 0;
    this.loadSprite = async function() {
    //this.xml = await loadFile("./images/" + this.src + ".xml");
    //console.log(this.xml)
    }
    this.setSprite = function(path) {
        this.src = "./images/" + path + ".png";
    }
    /*this.loadHTMLSprite = function(name) {
        this.src = 
    }*/
    this.addAnimation = function(name, path, fps, loop) {
        this.animations.push(new NovaAnimation(name, path, fps, loop));
    }
    this.draw = function() {
        var daEl = document.getElementById('spriteVar');
        daEl.src = this.src;
        this.width = daEl.width;
        this.height = daEl.height;
        ctx.drawImage(daEl, this.x, this.y, daEl.width*this.scale.x, daEl.height*this.scale.y);
    }
}
function NovaButton(label, x, y, src) {
    this.type = "NovaButton";
    
    this.label = label;
    this.labelX = 0;
    this.x = x;
    this.y = y;
    this.buttonWidth = 100;
    //this.buttonHeight = ;
    this.width = 0;
    this.height = 0;
    this.scale = new NovaPoint(1, 1);
    this.src = "./images/" + src + ".png";
    this.animationIndex = -1;
    this.clickCallback = function() { 
        console.log("Clicked On \"" + this.label + "\""); 
    }
    this.draw = function() {
        var daEl = document.createElement("img");;
        daEl.src = this.src;
        var daWidth = 10;
        var daHeight = 20;
        this.width = (daWidth*2)+this.buttonWidth;
        this.height = daHeight*2;
        if (this.animationIndex != -1) {
            // Top
            ctx.drawImage(daEl, (daWidth*2)*this.animationIndex, 0, daWidth, daHeight, this.x, this.y, daWidth*this.scale.x, daHeight*this.scale.y);
            ctx.drawImage(daEl, daWidth+((daWidth*2)*this.animationIndex), 0, 1, daHeight, this.x+daWidth, this.y, (this.buttonWidth)*this.scale.x, daHeight*this.scale.y);
            ctx.drawImage(daEl, daWidth+((daWidth*2)*this.animationIndex), 0, daWidth, daHeight, this.x + daWidth + this.buttonWidth, this.y, daWidth*this.scale.x, daHeight*this.scale.y);

            // Bottom
            ctx.drawImage(daEl, (daWidth*2)*this.animationIndex, daHeight, daWidth, daHeight, this.x, this.y+(daHeight*this.scale.y), daWidth*this.scale.x, daHeight*this.scale.y);
            ctx.drawImage(daEl, daWidth+((daWidth*2)*this.animationIndex), daHeight, 1, daHeight, this.x+daWidth, this.y+(daHeight*this.scale.y), (this.buttonWidth)*this.scale.x, daHeight*this.scale.y);
            ctx.drawImage(daEl, daWidth+((daWidth*2)*this.animationIndex), daHeight, daWidth, daHeight, this.x + daWidth + this.buttonWidth, this.y+(daHeight*this.scale.y), daWidth*this.scale.x, daHeight*this.scale.y);
        }

        // Text
        ctx.font = "bold 20px serif";
        var textSize = ctx.measureText(this.label);
        ctx.lineWidth = 4;
        ctx.strokeText(this.label, this.x + this.labelX - (this.buttonWidth/2), this.y+22.5);
        ctx.fillStyle = "white";
        ctx.fillText(this.label, this.x + this.labelX - (this.buttonWidth/2), this.y+22.5);
    }
}

function NovaMouse() {
    this.clicked = false;
    this.pressed = false;
    this.x = 0;
    this.y = 0;
    this.frame = Date.now()
    this.update = function() {
        Date.now() > this.frame ? this.clicked ? this.clicked = false : 0 : 0
    }
    this.overlaps = function(sprite) {
        if ((this.x > sprite.x && this.x < sprite.x + sprite.width) &&
            (this.y > sprite.y && this.y < sprite.y + sprite.height)) {
            return true;
        } else {
            return false;
        }
    }
}

// -- Handlers -- \\
var mouse = new NovaMouse();
const mouseHandler = (e) => {
  var daType = e.type.toString();
  switch (daType) {
    case "mousemove":
      mouse.x = e.pageX;
      mouse.y = e.pageY;
      //console.log(mouse.x, mouse.y)
      break;
    case "mousedown":
      mouse.pressed = true;
      mouse.clicked = true;
      mouse.frame = Date.now();
      break;
    case "mouseup":
      mouse.pressed = false;
      mouse.clicked = false;
      break;
    case "wheel":
      camGame.targetZoom = camGame.zoom + event.deltaY * -0.005
      break;
  }
}
document.addEventListener("mousedown", mouseHandler);
document.addEventListener("mouseup", mouseHandler);
document.addEventListener("mousemove", mouseHandler);


var canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function updateCanvas() {
    document.getElementById("game").width = document.documentElement.clientWidth;
    canvas.width = document.documentElement.clientWidth;
    document.getElementById("game").height = document.documentElement.clientHeight;
    canvas.height = document.documentElement.clientHeight;
}
updateCanvas();

var testSprite = new NovaSprite(0, 0, "ui/topmenu");
add(testSprite);

var testButton = new NovaButton("File", 0, 0, "ui/button");
testButton.scale.set(1, 1.4);
testButton.buttonWidth = 50;
testButton.labelX = 42.5;
add(testButton);

var testButton = new NovaButton("Edit", 70, 0, "ui/button");
testButton.scale.set(1, 1.4);
testButton.buttonWidth = 50;
testButton.labelX = 42.5;
add(testButton);

var main = function() {
    
    updateCanvas();

    for (let i = 0; i < objects.length; i++) {
        var object = objects[i];
        object.draw();

        if (object.type = "NovaButton") {
            if (mouse.overlaps(object)) {
                if (mouse.clicked) {
                    if (object.clickCallback !== undefined) {
                        object.clickCallback();
                    }
                } else if (mouse.pressed) {
                    object.animationIndex = 2;
                } else {
                    object.animationIndex = 1;
                }
            } else {
                object.animationIndex = 0;
            }
        }
    }

    
    testSprite.scale.set(canvas.width/testSprite.width, 1.5);
    mouse.update();
    mouse.clicked = false;
}

var fps = 60;
var framerate = 1000 / fps;
setInterval(main, framerate);
//testSprite.loadSprite()