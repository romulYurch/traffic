import Point2d from "./point2d";
import MouseSmoothMove from "./mouseSmothMove";

export default class ViewPort
{
	constructor(canvasID, screenWidth, screenHeight)
	{
		this.canvas = document.getElementById(canvasID); //
		this.canvas.width = screenWidth;
		this.canvas.height = screenHeight;

		this.ctx = this.canvas.getContext("2d");

		this.offset = $(this.canvas).offset();

		this.LeftTop = new Point2d(0, 0);
		this.zoom = 1;

		new MouseSmoothMove(this);
	}

	clear()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
}