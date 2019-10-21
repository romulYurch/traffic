import Point2d from "./point2d";

export default class ViewPort
{
	/*public canvas;
	ctx;

	offset;
	screenWidth;
	screenHeight;
	mapWidth;
	mapHeight;
	zoom;*/

	constructor(canvasID, screenWidth, screenHeight)
	{
		this.canvas = document.getElementById(canvasID); //
		this.canvas.width = screenWidth;
		this.canvas.height = screenHeight;

		this.ctx = this.canvas.getContext("2d");

		this.offset = $(this.canvas).offset();

		this.LeftTop = new Point2d(0, 0);
		this.zoom = 1;
	}
}