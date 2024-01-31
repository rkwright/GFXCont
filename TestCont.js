/**
* Copyright (c) 1986-2024 Richard K. Wright. All rights reserved.
*
* This work is licensed under the terms of the MIT license.
* For a copy, see <https://opensource.org/licenses/MIT>.
*
* TestCont.js
*
* This is a short script to exercise (test) the basic functionality
* of the contouring library and, by implication. all the underlying
* libs (math_ext etc.)  as well.  It is not intended as a thorough
* test of the contour-threading routine. Note also that this initial
* version supports only the grid-based contouring routines.
*
*/

'use strict';
// const REVISION = '0.2.0';

const  WIN_MARGIN =  0.1;  // space between canvas and border of display

let array4x3 = [
    [1, 3, 1],
    [0, 5, 1],
    [1, 1, 3],
    [0, 0, 0]
];

let array3x3 = [
    [1, 3, 1],
    [0, 5, 1],
    [1, 1, 3]
];

let gridHeight, gridWidth;              // drawable portion of display
let margHeight, margWidth;              // "unprintable" portion of display

let gridMat;                            // main CTM
let canvas;                             // HTML canvas element
let contour = new Contour();   // Geo-F/X Contour object

//---------------------- main  ------------------

initCanvas();
gridMat = createGrid( array3x3 );
drawGrid( array3x3 );
drawContours( array3x3, 2.0 );

//--------------------- local --------------------

/**
 * Literally creates the canvas and sets the basic params
 * for the window
 */
function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = "gfxCanvas";

    // we use the clientWidth property (instead of innerWidth) here because it
    // gives us the width of the whole window, less the width of the scrollbar, if any.
    // *But* we can't use the clientHeight property because normally
    // its value will be 0 at the time this method is called
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
}

/**
 * Defines a simple grid as implied by using the dimensions of the
 * array as the scale-factors of the grid.
 *
 * @param array
 */
function createGrid ( array ) {

    if (canvas.width >= canvas.height) {

        margHeight = WIN_MARGIN * canvas.height;
        gridHeight = canvas.height - margHeight * 2.0;
        gridWidth = gridHeight * array.length / array[0].length;
        margWidth = (canvas.width - gridWidth) / 2.0;

    } else {

        margWidth = WIN_MARGIN * canvas.width;
        gridWidth = canvas.width - margWidth * 2.0;
        gridHeight = gridWidth * array[0].length / array.length;
        margHeight = (canvas.height - gridHeight) / 2.0;
    }

    let mat = new Matrix();
    mat.translate(margWidth, margHeight);
    mat.scale(gridWidth / (array.length-1), gridHeight / (array[0].length-1));

    return mat;
}

/**
 *
 * @param array
 */
function drawGrid ( array ) {

    let ctx = canvas.getContext("2d");

    // now the grid lines, vertical then horizontal, both in pink
    ctx.strokeStyle = "pink";
    ctx.lineWidth = "2";

    let start,end;

    for ( let i = 0; i < (array.length-1); i++) {

        start = gridMat.transform(i, 0);
        end = gridMat.transform(i, (array[0].length-1))

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    for ( let j = 0; j < (array[0].length-1); j++) {

        start = gridMat.transform(0, j);
        end = gridMat.transform((array.length-1), j);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    // finally, draw the frame
    ctx.lineWidth = "6";
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.rect( margWidth, margHeight, gridWidth, gridHeight );
    ctx.stroke();

    return ctx;
}

/**
 * if needed, creates the contour object and initializes it.
 *  In any case, it with the specified level
 *
 * @param array
 * @param contInterval
 */
function drawContours ( array, contInterval ) {
    let startTime = performance.now();

    contour.setupContours( array, contInterval );

    contour.threadContour( array, 1, contInterval );

    let elapsed = (performance.now() - startTime)/1000.0;
    console.log("Contour complete at " + performance +".  Elapsed: " +  elapsed.toFixed(3)  );
}

/**
 * The user resized the window, so handle the event...
 *
 */
window.addEventListener('resize', function () {
    window.location.reload();
});


