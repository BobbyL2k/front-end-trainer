/* jshint browser: true, esversion: 6 */

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d");

// Class system
    var objectClasses = [
        {
            name: "Red Buoy",
            color: "#df4bFF"
        },
        {
            name: "Green Buoy",
            color: "#dfFF4b"
        }
    ]

    var currentClassIndex = 0;

    function setCurrentClassIndex(index) {
        console.log("Set to class", index, objectClasses[index]);
        currentClassIndex = index;
    }

    function getCurrentColor(){
        return objectClasses[currentClassIndex].color;
    }
// END Class System

// slider-bar-value change pen-size

    var canvas=document.getElementById("canvas");
    var ctx=canvas.getContext("2d");
    var cw=canvas.width;
    var ch=canvas.height;
    function reOffset(){
        var BB=canvas.getBoundingClientRect();
        offsetX=BB.left;
        offsetY=BB.top;
    }

    var offsetX,offsetY;
    reOffset();
    window.onscroll=function(e){ reOffset(); }
    window.onresize=function(e){ reOffset(); }

    var isDown=false;
    var startX,startY;

    ctx.lineCap='round';
    var linewidth=5;
    ctx.lineWidth=linewidth;

    $myslider=$('#myslider');
    $myslider.attr({min:1,max:25}).val(linewidth);
    $myslider.on('input change',function(){
        linewidth=ctx.lineWidth=parseInt($(this).val());
    });

    $("#canvas").mousedown(function(e){handleMouseDown(e);});
    $("#canvas").mousemove(function(e){handleMouseMove(e);});
    $("#canvas").mouseup(function(e){handleMouseUpOut(e);});
    $("#canvas").mouseout(function(e){handleMouseUpOut(e);});

    function handleMouseDown(e){
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        startX=parseInt(e.clientX-offsetX);
        startY=parseInt(e.clientY-offsetY);

        // Put your mousedown stuff here
        isDown=true;
    }

    function handleMouseUpOut(e){
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // Put your mouseup stuff here
        isDown=false;
    }

    function handleMouseMove(e){
        if(!isDown){return;}
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX=parseInt(e.clientX-offsetX);
        mouseY=parseInt(e.clientY-offsetY);

        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(mouseX,mouseY);
        ctx.stroke();

        startX=mouseX;
        startY=mouseY;
    }

// Brush Size System
    /*var brushSizes = [5, 10, 20];
    var brushIndex = 0;
    function setBrushIndex(index) {
        brushIndex = index;
    }
    function getBrushSize() {
        return brushSizes[brushIndex];
    }*/
// END Brush Size System

{// Class Picker button
    var CPButtonDiv = document.getElementById("class-picker-buttons-div");

    genClickHandler = function (index) {
        return function (event) {
            setCurrentClassIndex(index);
        }
    };

    for(var index in objectClasses){
        var newButton = document.createElement('button');
        newButton.setAttribute('type', 'button');
        newButton.innerHTML = objectClasses[index].name;
        CPButtonDiv.appendChild(newButton);
        var clickHandler = genClickHandler(index);
        $(newButton).click(clickHandler);
    }
}// END Class Picker button

{// Events
    {// Forms and Buttons
        $("#undo-button").click(function (event) {
           console.log("clicked undo");
           removeClick();
           redraw();
        });

        $("#small-button").click(function (event) {
           console.log("clicked small");
           setBrushIndex(0);
        });
        $("#medium-button").click(function (event) {
           console.log("clicked medium");
           setBrushIndex(1);
        });
        $("#large-button").click(function (event) {
           console.log("clicked large");
           setBrushIndex(2);
        });

        $("#submit-button").click(function (event) {
            var imageDataURL = canvas.toDataURL();
            var data = {
                img : imageDataURL,
                password : document.getElementById("password-input").value
            }
            console.log(data);
            $.post("/submit", data, function (params) {
                console.log(params);
            });
        });

        $("#getnew-button").click(function (event) {
            window.location.href = "/index.html#" + document.getElementById("password-input").value;
            window.location.reload();
        })

        $("#clear-button").click(function (event) {
            console.log($("clicked clear"))
            clearClick();
            redraw();
        });

        $("#password-input").val(window.location.hash.substr(1));
    }
    {// Canvas and Mouse state
        var $canvas = $(canvas);
        var paint;

        $canvas.mousedown(function(e){
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;

            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();
        });

        $canvas.mousemove(function(e){
            if(paint){
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                redraw();
            }
        });

        $canvas.mouseup(function(e) {
            paint = false;
        });

        $canvas.mouseleave(function(e) {
            paint = false;
        });
    }
}// END Events

// Drawing
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var clickColor = new Array();
    var clickSize = new Array();

    function clearClick(params) {
        clickX = new Array();
        clickY = new Array();
        clickDrag = new Array();
        clickColor = new Array();
    }

    function removeClick() {
        var isDrag = false;
        do {
            clickX.pop();
            clickY.pop();

            clickColor.pop();
            clickSize.pop();

            isDrag = clickDrag.pop();
        } while(isDrag);
    }

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);

        clickColor.push(getCurrentColor());
        clickSize.push(getBrushSize());

        clickDrag.push(dragging);
    }

    function redraw(){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

        context.lineJoin = "round";

        for(var index=0; index < clickX.length; index++) {
            context.strokeStyle = clickColor[index];
            context.lineWidth = clickSize[index];
            context.beginPath();
            if(clickDrag[index] && index>0) {
                context.moveTo(clickX[index-1], clickY[index-1]);
            } else {
                // Simulate micro move
                context.moveTo(clickX[index]-1, clickY[index]);
            }
            context.lineTo(clickX[index], clickY[index]);
            context.closePath();
            context.stroke();
        }
    }
// END Drawing
