"use strict";

const BG_COLOR = "#08090a";
const BLUE = "#3ab1d2";
const ORANGE = "#ffbc03";
const PINK = "#c22eb8";

const GAP = 8;
const MATRIX_GAP = 12; // gap between matrices in a 3D array
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

    if (shape.some(size => isNaN(size))) {
        alert("Enter a valid shape!");
        return;
    }

    [canvas.width, canvas.height] = canvas_size(shape);
    clear_canvas();
    draw(shape);
}

/*** UTILITY STUFF ***/
function is_digit(c) {
    return c >= "0" && c <= "9";
}

function parse_int(str) {
    for (let c of str) {
        if (!is_digit(c))
            return NaN;
    }

    return parseInt(str);
}

function canvas_size(shape) {
    let width = 2 * GAP,
        height = 2 * GAP;

    let n_mats, n_rows, n_cols;
    switch (shape.length) {
        case 1:
            width += CELL_SIZE * shape[0] + (shape[0] - 1) * GAP;
            height += CELL_SIZE;
            break;

        case 2:
            [n_rows, n_cols] = shape;
            width += 2 * GAP + CELL_SIZE * n_cols + (n_cols - 1) * GAP;
            height += n_rows * CELL_SIZE + (n_rows + 1) * GAP;
            break;

        case 3:
            [n_mats, n_rows, n_cols] = shape;
            width += 4 * GAP + n_cols * CELL_SIZE + (n_cols - 1) * GAP + (n_mats - 1) * MATRIX_GAP;
            height += 2 * GAP + n_rows * CELL_SIZE + (n_rows + 1) * GAP + (n_mats - 1) * MATRIX_GAP;
    }

    return [width, height];
}

function clear_canvas() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/*** DRAWING STUFF ***/
function draw(shape) {
    if (shape.length == 1)
        draw_1d(shape[0]);
    else if (shape.length == 2)
        draw_2d(shape[0], shape[1]);
    else if (shape.length == 3)
        draw_3d(shape[0], shape[1], shape[2])
    else
        draw_ndim(shape);

    canvas.toBlob(blob => {
        download_btn_el.href = URL.createObjectURL(blob);
        image_created = true;
    });
}

function draw_1d(len, x = GAP, y = GAP, bg_color = BG_COLOR) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(x, y, CELL_SIZE * len + (len - 1) * GAP, CELL_SIZE);

    let gap_x = x + CELL_SIZE;
    ctx.fillStyle = bg_color;
    for (let i = 1; i < len; ++i) {
        ctx.fillRect(gap_x, y, GAP, CELL_SIZE);
        gap_x += GAP + CELL_SIZE;
    }
}

function draw_2d(n_rows, n_cols, x = GAP, y = GAP, complete = true) {
    const matrix_width = 2 * GAP + n_cols * CELL_SIZE + (n_cols - 1) * GAP;
    const matrix_height = n_rows * CELL_SIZE + (n_rows + 1) * GAP;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(x, y, matrix_width, matrix_height)

    ctx.lineWidth = 2;
    ctx.strokeStyle = PINK;
    ctx.strokeRect(x, y, matrix_width, matrix_height);

    x += GAP;
    y += GAP;

    if (complete) {
        for (let i = 0; i < n_rows; ++i) {
            draw_1d(n_cols, x, y);
            y += CELL_SIZE + GAP;
        }
    } else {
        draw_1d(n_cols, x, y);
        y += CELL_SIZE + GAP;

        for (let i = 1; i < n_rows; ++i) {
            draw_1d(1, x, y);
            y += CELL_SIZE + GAP;
        }
    }
}

function draw_3d(n_mats, n_rows, n_cols, x = GAP, y = GAP) {
    let width = 4 * GAP + n_cols * CELL_SIZE + (n_cols - 1) * GAP + (n_mats - 1) * MATRIX_GAP;
    let height = 2 * GAP + n_rows * CELL_SIZE + (n_rows + 1) * GAP + (n_mats - 1) * MATRIX_GAP;

    ctx.lineWidth = 2;
    ctx.strokeStyle = ORANGE;
    ctx.strokeRect(x, y, width, height);

    x += GAP;
    y += GAP;

    for (let i = 1; i < n_mats; ++i) {
        draw_2d(n_rows, n_cols, x, y, false);
        x += MATRIX_GAP;
        y += MATRIX_GAP;
    }

    draw_2d(n_rows, n_cols, x, y);
}

function draw_ndim(shape) {
    let upper_dim_shape = shape.slice(0, -3);
    alert("Not yet implemented!");
}

function download_image(e) {
    if (!image_created) {
        e.preventDefault();
        alert("Image is not yet created!");
    }
}

visualize();