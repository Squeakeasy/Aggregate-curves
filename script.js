/* This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const GRAPH_AXIS_SIZE = 180;
const GRAPH_AXIS_OFFSET = 10.5;
const POINT_R = 5;
const PRICE_SCALE = 2;

let graphs = [];

if (typeof(Math.TAU) == "undefined") {
    Math.TAU = Math.PI * 2;
}

function make_prices() {
    const prices = [];
    for (let y = 0; y < 100; y += 10) {
	prices.push(y);
    }
    return prices;
}
const PRICES = make_prices();

function make_price_points() {
    const points = {};
    for (let price of PRICES) {
	points[price] = 0;
    }
    return points;
}

class Graph {
    constructor(el) {
	this.el = el;
	this.el.addEventListener("click", (e) => this.click(e));
	this.axis_size = GRAPH_AXIS_SIZE;
	this.axis_offset = GRAPH_AXIS_OFFSET;
	this.price_points = make_price_points();
    }
    get_price_point(index) {
	return this.price_points[PRICES[index]];
    }
    
    draw() {
	const ctx = this.el.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, this.el.width, this.el.height);

	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";

	ctx.save();
	ctx.translate(this.axis_offset, this.axis_offset);
	ctx.beginPath();

	ctx.moveTo(0, this.axis_size);
	ctx.lineTo(this.axis_size, this.axis_size);

	ctx.moveTo(0, this.axis_size);
	ctx.lineTo(0, 0);

	ctx.stroke();

	this.draw_price_guides(ctx);
	
	this.draw_points(ctx);
	
	ctx.restore();
    }
    draw_price_guides(ctx) {
	ctx.strokeStyle = "#aaa";
	ctx.beginPath();
	for (let price of PRICES) {
	    ctx.moveTo(0, price * PRICE_SCALE);
	    ctx.lineTo(this.axis_size, price * PRICE_SCALE);
	}
	ctx.stroke();
    }
    draw_points(ctx) {
	if (this.price_points.length == 0) {
	    return;
	}
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.moveTo(this.get_price_point(0), this.axis_size - PRICES[0] * PRICE_SCALE);
	for (let price of PRICES) {
	    ctx.lineTo(this.price_points[price], this.axis_size - price * PRICE_SCALE);
	}
	ctx.stroke();

	ctx.fillStyle = "blue";
	for (let price of PRICES) {
	    ctx.beginPath();
	    ctx.arc(this.price_points[price], this.axis_size - price * PRICE_SCALE,
		    POINT_R, 0, Math.TAU, false);
	    ctx.fill();
	}
    }

    adjust_price_point(price, amount) {
	let p = 0;
	do {
	    p++;
	} while (PRICES[p] < price);
	if (Math.abs(PRICES[p - 1] - price) < Math.abs(PRICES[p] - price)) {
	    this.price_points[PRICES[p - 1]] = amount;
	} else {
	    this.price_points[PRICES[p]] = amount;
	}
    }
    
    click(e) {
	const price = (this.axis_size - (e.offsetY - this.axis_offset)) / PRICE_SCALE;
	this.adjust_price_point(price, e.offsetX - this.axis_offset);
	this.draw();
    }
};

function draw_graphs(graphs) {
    for (let g of graphs) {
	g.draw();
    }
}

function init() {
    for (let canvas of document.querySelectorAll("canvas")) {
	canvas.width = 210;
	canvas.height = 210;
	graphs.push(new Graph(canvas));
    }
    draw_graphs(graphs);
}

init();
