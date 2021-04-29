const GRAPH_AXIS_SIZE = 80;
const GRAPH_AXIS_OFFSET = 10.5;

let graphs = [];

class Graph {
    constructor(el) {
	this.el = el;
	this.el.addEventListener("click", (e) => this.click(e));
	this.axis_size = GRAPH_AXIS_SIZE;
	this.axis_offset = GRAPH_AXIS_OFFSET;
	this.points = [];
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

	if (this.points.length > 0) {
	    ctx.beginPath();
	    ctx.strokeStyle = "blue";
	    ctx.moveTo(this.points[0].x, this.points[0].y);
	    if (this.points.length == 1) {
		ctx.lineTo(this.points[0].x, this.points[0].y);
	    } else {
		for (let point of this.points) {
		    ctx.lineTo(point.x, point.y);
		}
	    }
	    ctx.stroke();
	}
	
	ctx.restore();
    }

    click(e) {
	console.log("Click on graph", e);
	this.points.push({x: e.clientX - this.axis_offset,
			  y: e.clientY - this.axis_offset});
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
