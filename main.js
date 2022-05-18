"use strict";

const BG_COLOR = "#08090a";
const BLUE = "#3ab1d2";
const ORANGE = "#ffbc03";
const PINK = "#c22eb8";
const RED = "#C1554D";
const GREEN = "#97B82B";
const LIGHT_YELLOW = "#FFEDCB";

const colors = [LIGHT_YELLOW, RED, GREEN, PINK, BLUE];

const LINE_WIDTH = 2;

const GAP = 10;
const MATRIX_GAP_X = 15; // gap between matrices in a 3D array
const MATRIX_GAP_Y = 13; // gap between matrices in a 3D array
const ND_SHAPE_GAP = 25 // gap between 3D - ND shapes
const CELL_SIZE = 25;

const canvas = document.getElementById("vis");
const shape_input_el = document.getElementById("shape");
const download_btn_el = document.getElementById("download-btn");
const draw_btn_el = document.getElementById("draw-btn");

draw_btn_el.onclick = visualize;
download_btn_el.onclick = download_image;

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

    [canvas.width, canvas.height] = shape_size(shape);
    canvas.width += 2 * GAP;
    canvas.height += 2 * GAP;

    clear_canvas();
    draw(shape);
}

/*** utility functions ***/
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

function shape_size(shape) {
    const ndims = shape.length;
    let width, height;

    if (ndims == 1) {
        width = CELL_SIZE * shape[0] + (shape[0] - 1) * GAP;
        height = CELL_SIZE;
    } else if (ndims == 2) {
        const [n_rows, n_cols] = shape;
        width = n_cols * CELL_SIZE + (shape[1] + 1) * GAP;
        height = n_rows * CELL_SIZE + (n_rows + 1) * GAP;
    } else if (ndims == 3) {
        const [n_mats, n_rows, n_cols] = shape;
        width = n_cols * CELL_SIZE + (n_cols + 3) * GAP + (n_mats - 1) * MATRIX_GAP_X;
        height = n_rows * CELL_SIZE + (n_rows + 3) * GAP + (n_mats - 1) * MATRIX_GAP_Y;
    } else {
        [width, height] = shape_size(shape.slice(-3));

        let horizontal = true;
        for (let i = ndims - 4; i >= 0; --i) {
            if (horizontal) {
                width *= shape[i];
                width += (shape[i] - 1) * ND_SHAPE_GAP;
            } else {
                height *= shape[i];
                height += (shape[i] - 1) * ND_SHAPE_GAP;
            }

            width += 2 * GAP;
            height += 2 * GAP;

            horizontal = !horizontal;
        }
    }

    return [width, height];
}

function clear_canvas() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function download_image(e) {
    if (!image_created) {
        e.preventDefault();
        alert("Image is not yet created!");
    }
}

/*** drawing functions ***/
function draw(shape) {
    if (shape.length == 1)
        draw_1d(shape, GAP, GAP);
    else if (shape.length == 2)
        draw_2d(shape, GAP, GAP);
    else
        draw_nd(shape, GAP, GAP);

    canvas.toBlob(blob => {
        download_btn_el.href = URL.createObjectURL(blob);
        image_created = true;
    });
}

function draw_1d(shape, x, y, bg_color = BG_COLOR) {
    const [width, height] = shape_size(shape);
    const [len] = shape;

    ctx.fillStyle = BLUE;
    ctx.fillRect(x, y, width, height);

    let gap_x = x + CELL_SIZE;
    ctx.fillStyle = bg_color;
    for (let i = 1; i < len; ++i) {
        ctx.fillRect(gap_x, y, GAP, CELL_SIZE);
        gap_x += GAP + CELL_SIZE;
    }
}

function draw_2d(shape, x, y, draw_whole = true) {
    const [width, height] = shape_size(shape);
    const [n_rows, n_cols] = shape;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(x, y, width, height)

    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = PINK;
    ctx.strokeRect(x, y, width, height);

    x += GAP;
    y += GAP;

    if (draw_whole) {
        for (let i = 0; i < n_rows; ++i) {
            draw_1d([n_cols], x, y);
            y += CELL_SIZE + GAP;
        }
    } else {
        draw_1d([n_cols], x, y);
        y += CELL_SIZE + GAP;

        for (let i = 1; i < n_rows; ++i) {
            draw_1d([1], x, y);
            y += CELL_SIZE + GAP;
        }
    }
}

function draw_3d(shape, x, y) {
    const [width, height] = shape_size(shape);
    const [n_mats, n_rows, n_cols] = shape;

    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = ORANGE;
    ctx.strokeRect(x, y, width, height);

    const shape_end_x = x + width,
        shape_end_y = y + height;

    x += GAP;
    y += GAP;

    for (let i = 1; i < n_mats; ++i) {
        draw_2d([n_rows, n_cols], x, y, false);
        x += MATRIX_GAP_X;
        y += MATRIX_GAP_Y;
    }

    draw_2d([n_rows, n_cols], x, y);
    return [shape_end_x, shape_end_y];
}

function draw_nd(shape, x, y) {
    const ndims = shape.length;
    if (ndims == 3)
        return draw_3d(shape, x, y);

    let [width, height] = shape_size(shape);

    ctx.strokeStyle = colors[(ndims - 3) % colors.length];
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeRect(x, y, width, height);

    const shape_end_x = x + width,
        shape_end_y = y + height;

    x += GAP;
    y += GAP;

    let horizontal = ndims % 2 == 0;
    for (let i = 0; i < shape[0]; ++i) {
        const [new_x, new_y] = draw_nd(shape.slice(1), x, y);

        if (horizontal)
            x = new_x + ND_SHAPE_GAP;
        else
            y = new_y + ND_SHAPE_GAP;
    }

    return [shape_end_x, shape_end_y];
}

visualize();