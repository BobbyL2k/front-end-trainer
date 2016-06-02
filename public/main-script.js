/* jshint browser: true, esversion: 6 */

 canvas = document.getElementById("canvas")
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

// Brush Size System
    var brushSize = 5;
    $myslider = $('#brush-size-slider');
    $myslider.attr({min:1, max:25}).val(brushSize);
    $myslider.on('input change',function(){
        brushSize = parseInt($myslider.val());
    });
    function getBrushSize() {
        return brushSize;
    }
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
                id : frame_id,
                img : imageDataURL
            }
            console.log(data);
            $.post("/submit", data, function (params) {
                console.log(params);
            });
        });

        $("#getnew-button").click(function (event) {
            window.location.reload();
        })

        $("#clear-button").click(function (event) {
            console.log($("clicked clear"))
            clearClick();
            redraw();
        });

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

var $canvasdiv = $('#canvas-div');
$.get('/getframeid',function(data){
  frame_id = data;
  $canvasdiv.css('background','url(img.jpg?id='+frame_id+')');
});
