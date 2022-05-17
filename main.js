"use strict";

const BG_COLOR = "#08090a";
const BLUE = "#3ab1d2";
const ORANGE = "#ffc457";
const PINK = "#c22eb8";

const GAP = 10;
const CELL_SIZE = 25;

const canvas = document.getElementById("vis");
const shape_input_el = document.getElementById("shape");
const download_btn_el = document.getElementById("download-btn");
const draw_btn_el = document.getElementById("draw-btn");

draw_btn_el.onclick = visualize;
download_btn_el.onclick = download_image;

canvas.width = 600;
canvas.height = 600;

const ctx = canvas.getContext("2d");

let image_created = false;

function visualize() {
    image_created = false;

    let shape = (
        shape_input_el.value
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .map(size => parse_int(size))
    );

    console.log(shape);

    if (shape.some(size => isNaN(size))) {
        alert("Cannot parse gibberish! Enter a valid shape.");
        return;
    }

    [canvas.width, canvas.height] = canvas_size(shape);
    clear_canvas();
    vis_draw(shape);

    canvas.toBlob(blob => {
        download_btn_el.href = URL.createObjectURL(blob);
        image_created = true;
    });
}

/*** UTILITY STUFF ***/
function is_digit(c) {
    return c >= "0" && c <= "9";
}

function parse_int(str) {
    for (let c in str) {
        if (!is_digit(c))
            return NaN;
    }

    return parseInt(str);
}

function canvas_size(shape) {
    let width = 2 * GAP,
        height = 2 * GAP;

    if (shape.length == 1) {
        width += CELL_SIZE * shape[0] + (shape[0] - 1) * GAP;
        height += CELL_SIZE;
    } else if (shape.length == 2) {
        let [n_rows, n_cols] = shape;
        width += 2 * GAP + CELL_SIZE * n_cols + (n_cols - 1) * GAP;
        height += n_rows * CELL_SIZE + (n_rows + 1) * GAP;
    }

    return [width, height];
}

function clear_canvas() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/*** DRAWING STUFF ***/
function vis_draw(shape) {
    if (shape.length == 1)
        draw_vector(shape[0]);
    else if (shape.length == 2)
        draw_matrix(shape[0], shape[1]);
    else
        draw_ndim(shape);
}

function draw_vector(len, x = GAP, y = GAP, bg_color = BG_COLOR) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(x, y, CELL_SIZE * len + (len - 1) * GAP, CELL_SIZE);

    let gap_x = x + CELL_SIZE;
    ctx.fillStyle = bg_color;
    for (let i = 1; i < len; ++i) {
        ctx.fillRect(gap_x, y, GAP, CELL_SIZE);
        gap_x += GAP + CELL_SIZE;
    }
}

function draw_matrix(n_rows, n_cols, x = GAP, y = GAP) {
    let matrix_width = 2 * GAP + n_cols * CELL_SIZE + (n_cols - 1) * GAP;
    let matrix_height = n_rows * CELL_SIZE + (n_rows + 1) * GAP;

    ctx.lineWidth = 2;
    ctx.strokeStyle = PINK;
    ctx.strokeRect(x, y, matrix_width, matrix_height);

    x += GAP;
    y += GAP;

    for (let i = 0; i < n_rows; ++i) {
        draw_vector(n_cols, x, y);
        y += CELL_SIZE + GAP;
    }
}

function draw_ndim(shape) {
    let upper_dim_shape = shape.slice(0, -2);
}

function download_image(e) {
    if (!image_created) {
        e.preventDefault();
        alert("Image is not yet created!");
    }
}