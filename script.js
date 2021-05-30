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

const HOUR_SCALE = 15;
const HOURS_MAX = 16; // Keep in line with amount-input's number input max

const X_AXIS_SPACE = 35; // Keep in line with amount <canvas> height is greater than 300
const Y_LABELS = 30;

let graphs = [];

if (typeof(Math.TAU) == "undefined") {
    Math.TAU = Math.PI * 2;
}

function make_prices() {
    const prices = [];
    for (let y = 10; y <= 100; y += 10) {
	prices.push(y);
    }
    return prices;
}
const PRICES = make_prices();

function make_hours() {
    const hours = [];
    for (let x = 0; x <= HOURS_MAX; x += 2) {
	hours.push(x);
    }
    return hours;
}
const HOURS = make_hours();

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
	this.reset_button = this.shadow.querySelector(".reset button");
	this.reset_button.graph = this;
	this.suppress_inputs = false;
	this.axis_offset = GRAPH_AXIS_OFFSET;
	this.y_axis_size = this.canvas.height - X_AXIS_SPACE - this.axis_offset * 2;
	this.x_axis_size = this.y_axis_size;
	this.price_points = make_price_points();
	
	this.amount_inputs = {};
	for (let amount_input of this.shadow.querySelectorAll("#values tr")) {
	    if (amount_input.classList.contains("reset") || amount_input.querySelector("th")) {
		continue;
	    }
	    amount_input.graph = this;
	    this.amount_inputs[amount_input.dataset.price] = amount_input;
	}

	this._in_use = false;
    }
    get in_use() {
	return this._in_use;
    }
    set in_use(val) {
	this._in_use = val;
	this.reset_button.disabled = !this._in_use;
    }
    update_attrs(el) {
	const title = el.getAttribute("title");
	const title_el = this.shadow.querySelector("#title");
	if (title) {
	    title_el.textContent = title;
	    title_el.setAttribute("contenteditable", false);
	    title_el.classList.add("static");
	} else {
	    title_el.textContent += " " + el.getAttribute("pos");
	}
    }
    connectedCallback() {
	this.update_attrs(this);
    }
    reset() {
	this.in_use = false;
	for (let price of PRICES) {
	    this.adjust_price_point(price, 0);
	}
	this.draw();
    }
    get_price_point(index) {
	return this.price_points[PRICES[index]];
    }
    make_summary() {
	this.suppress_inputs = true;
	this.shadow.querySelector("input.label").value = "Average";
	this.shadow.querySelector("input.label").disabled = true;
	this.reset_button.style.display = "none";
	for (let el in this.amount_inputs) {
	    this.amount_inputs[el].querySelector("input").disabled = true;
	}
	this.draw();
    }	
    hours_to_x(price_point) {
	return price_point * HOUR_SCALE;
    }
    draw() {
	const ctx = this.canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";

	ctx.save();
	ctx.translate(this.axis_offset, this.axis_offset);

	ctx.save();
	ctx.translate(Y_LABELS, 0);
	ctx.beginPath();

	ctx.moveTo(0, this.y_axis_size);
	ctx.lineTo(this.x_axis_size, this.y_axis_size);

	ctx.moveTo(0, this.y_axis_size);
	ctx.lineTo(0, 0);

	ctx.stroke();

	this.draw_price_guides(ctx);
	this.draw_points(ctx);

	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	for (let hour of HOURS) {
	    ctx.fillText("" + hour, this.hours_to_x(hour),
			 this.y_axis_size + 18);
	}
	ctx.fillText("Hours per day", this.x_axis_size / 2 - Y_LABELS / 2, this.y_axis_size + 32);
	
	ctx.restore();

	ctx.fillStyle = "black";
	ctx.textBaseline = "middle";
	for (let price of PRICES) {
	    ctx.fillText("" + price, 5, this.y_axis_size - (price - 10) * PRICE_SCALE);
	}

    	ctx.restore();

	ctx.save();
	ctx.fillStyle = "black";
	ctx.font = "12px sans-serif";
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "center";
	ctx.translate(10, this.y_axis_size / 2);
	ctx.rotate(-Math.TAU / 4);
	ctx.fillText("Wages ($/hour)", 0, 0);
	ctx.restore();

    }
    draw_price_guides(ctx) {
	ctx.strokeStyle = "#aaa";
	ctx.beginPath();
	for (let price of PRICES) {
	    ctx.moveTo(0, this.y_axis_size - (price - 10) * PRICE_SCALE);
	    ctx.lineTo(this.x_axis_size, this.y_axis_size - (price - 10) * PRICE_SCALE);
	}
	ctx.stroke();
    }
    draw_points(ctx) {
	if (this.price_points.length == 0) {
	    return;
	}
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.moveTo(this.hours_to_x(this.get_price_point(0)), this.y_axis_size - (PRICES[0] - 10) * PRICE_SCALE);
	for (let price of PRICES) {
	    ctx.lineTo(this.hours_to_x(this.price_points[price]), this.y_axis_size - (price - 10) * PRICE_SCALE);
	}
	ctx.stroke();

	ctx.fillStyle = "blue";
	for (let price of PRICES) {
	    ctx.beginPath();
	    ctx.arc(this.hours_to_x(this.price_points[price]), this.y_axis_size - (price - 10) * PRICE_SCALE,
		    POINT_R, 0, Math.TAU, false);
	    ctx.fill();
	}
    }

    adjust_price_point(price, amount) {
	if (amount < 0) {
	    amount = 0;
	}
	if (amount > HOURS_MAX) {
	    amount = HOURS_MAX;
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
	this.amount_inputs[price].set_amount(this.price_points[price]);
    }
    
    click(e) {
	if (this.suppress_inputs) {
	    return;
	}
	this.in_use = true;
	const price = (this.y_axis_size - (e.offsetY - this.axis_offset)) / PRICE_SCALE + 10;
	this.adjust_price_point(price, (e.offsetX - this.axis_offset - Y_LABELS) / HOUR_SCALE);
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
	this.querySelector("#price input").value = this.dataset.price;
	this.set_amount(0);
    }
    input_changed(e) {
	if (this.graph) {
	    this.graph.price_points[this.dataset.price] = parseInt(this.input.value);
	    this.graph.in_use = true;
	    this.graph.draw();
	}
    }
    set_amount(amount) {
	this.input.value = amount;
    }
};
customElements.define("amount-input", AmountInput, { extends: "tr" });

function click_reset(e) {
    e.target.graph.reset();
}

function calculate_summary() {
    for (let price of PRICES) {
	summary_graph.price_points[price] = 0;
    }
    let count = 0;
    for (let graph of document.querySelectorAll("supply-demand-curve")) {
	if (graph == summary_graph) {
	    continue;
	}
	if (!graph.in_use) {
	    continue;
	}
	count++;
	for (let price of PRICES) {
	    summary_graph.price_points[price] += graph.price_points[price];
	}
    }
    if (count == 0) {
	alert("You must enter data in at least one graph to see an average!");
	return;
    }
    for (let price of PRICES) {
	summary_graph.price_points[price] /= count;
	summary_graph.amount_inputs[price].set_amount(summary_graph.price_points[price]);
    }
    summary_graph.draw();
}


function draw_graphs(graphs) {
    for (let g of graphs) {
	g.draw();
    }
}

const summary_graph = document.getElementById("summary-graph");

function init() {
    draw_graphs(document.querySelectorAll("supply-demand-curve"));

    summary_graph.make_summary();
}

init();
