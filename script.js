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

const GRAPH_AXIS_OFFSET = 10.5;
const POINT_R = 5;
const PRICE_SCALE = 3;

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

class SupplyDemandCurve extends HTMLElement {
    constructor() {
	super();
	const template = document.getElementById("supply-demand-curve");
    	this.shadow = this.attachShadow({mode: "open"});
	this.shadow.appendChild(template.content.cloneNode(true));
	this.canvas = this.shadow.querySelector("canvas");
	this.canvas.addEventListener("click", (e) => this.click(e));
	this.axis_offset = GRAPH_AXIS_OFFSET;
	this.axis_size = this.canvas.height - this.axis_offset * 2;
	this.price_points = make_price_points();

	this.amount_inputs = {};
	for (let amount_input of this.shadow.querySelectorAll("#values tr")) {
	    amount_input.graph = this;
	    this.amount_inputs[amount_input.dataset.price] = amount_input;
	}
    }
    get_price_point(index) {
	return this.price_points[PRICES[index]];
    }
    
    draw() {
	const ctx = this.canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
	    ctx.moveTo(0, this.axis_size - price * PRICE_SCALE);
	    ctx.lineTo(this.axis_size, this.axis_size - price * PRICE_SCALE);
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

    adjust_price_point(price, amount, propagate) {
	if (amount < 0) {
	    amount = 0;
	}
	let p = 0;
	do {
	    p++;
	} while (PRICES[p] < price);
	if (p == PRICES.length) {
	    price = PRICES[PRICES.length - 1];
	} else if (Math.abs(PRICES[p - 1] - price) < Math.abs(PRICES[p] - price)) {
	    price = PRICES[p - 1];
	} else {
	    price = PRICES[p]
	}
	this.price_points[price] = Math.floor(amount);
	if (propagate != false) {
	    this.amount_inputs[price].set_amount(Math.floor(amount));
	}
    }
    
    click(e) {
	const price = (this.axis_size - (e.offsetY - this.axis_offset)) / PRICE_SCALE;
	this.adjust_price_point(price, e.offsetX - this.axis_offset);
	this.draw();
    }
};
customElements.define("supply-demand-curve", SupplyDemandCurve);

class AmountInput extends HTMLTableRowElement {
    constructor() {
	super();
	const template = document.getElementById("amount-input");
	this.appendChild(template.content.cloneNode(true));
	this.input = this.querySelector("input[type='number']");
	this.input.addEventListener("change", (e) => this.input_changed(e));
	this.querySelector("#price").textContent = this.dataset.price;
	this.set_amount(0);
    }
    input_changed(e) {
	if (this.graph) {
	    this.graph.adjust_price_point(this.dataset.price, this.input.value, false);
	    this.graph.draw();
	}
    }
    set_amount(amount) {
	this.input.value = amount;
    }
};
customElements.define("amount-input", AmountInput, { extends: "tr" });


function draw_graphs(graphs) {
    for (let g of graphs) {
	g.draw();
    }
}

function init() {
    draw_graphs(document.querySelectorAll("supply-demand-curve"));
}

init();
