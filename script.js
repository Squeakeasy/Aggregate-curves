const GRAPH_AXIS_SIZE = 180;
const GRAPH_AXIS_OFFSET = 10.5;
const POINT_R = 5;
const PRICE_SCALE = 2;

let graphs = [];

if (typeof(Math.TAU) == "undefined") {
    Math.TAU = Math.PI * 2;
}

function make_points() {
    const points = [];
    for (let y = 0; y <= 100; y += 10) {
	points.push({x: 0, y: y});
    }
    return points;
}

class Graph {
    constructor(el) {
	this.el = el;
	this.el.addEventListener("click", (e) => this.click(e));
	this.axis_size = GRAPH_AXIS_SIZE;
	this.axis_offset = GRAPH_AXIS_OFFSET;
	this.points = make_points();
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

	this.draw_points(ctx);
	
	ctx.restore();
    }
    draw_points(ctx) {
	if (this.points.length == 0) {
	    return;
	}
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.moveTo(this.points[0].x, this.axis_size - this.points[0].y * PRICE_SCALE);
	for (let point of this.points) {
	    ctx.lineTo(point.x, this.axis_size - point.y * PRICE_SCALE);
	}
	ctx.stroke();

	ctx.fillStyle = "blue";
	for (let point of this.points) {
	    ctx.beginPath();
	    ctx.arc(point.x, this.axis_size - point.y * PRICE_SCALE, POINT_R, 0, Math.TAU, false);
	    ctx.fill();
	}
    }

    click(e) {
	//	this.points.push({x: e.clientX - this.axis_offset,
//			  y: e.clientY - this.axis_offset});
	this.draw();
    }
};

function draw_graphs(graphs) {
    for (let g of graphs) {
	g.draw();
    }
}

function init() {
    graphs.push(new Graph(document.getElementById("canvas")));
    graphs.push(new Graph(document.getElementById("canvas2")));
    draw_graphs(graphs);
}

init();
