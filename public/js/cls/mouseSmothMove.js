import Point2d from "./point2d";

export default class MouseSmoothMove
{

	constructor(viewport, params)
	{
		params = params || {};

		this.viewport = viewport;

		this.smoothSpeedParts = params.smoothSpeedParts || 5;
		this.smoothPartInterval = params.smoothPartInterval || 30;
		this.maxMouseMoveSmoothOffset = params.maxMouseMoveSmoothOffset || 10;

		this.smoothMoveInterval = null;
		this.smoothMoveTo = new Point2d(0, 0);
		this.smoothMoveDir = null;

		this.prevMousePos = new Point2d(0, 0);

		let ths = this;
		$(viewport.canvas).mousemove(function(e)
		                    {
			                    if(e.which == 1) //нажата левая кнопка
			                    {
				                    ths.smoothStop();
				                    let x = viewport.leftTop.x + e.pageX - ths.prevMousePos.x;
				                    let y = viewport.leftTop.y + e.pageY - ths.prevMousePos.y;

				                    ths.changeLeftTop(x, y, true);
			                    }
			                    ths.prevMousePos.x = e.pageX;
			                    ths.prevMousePos.y = e.pageY;
		                    });

		$(viewport.canvas).mouseup(function(e)
		                    {
		                  	    if(e.which == 1) //left button was pressed
			                    {
				                    ths.smoothMoveTo = new Point2d(viewport.leftTop.x, viewport.leftTop.y);

				                    let mapWidth = viewport.mapWidth.zoom(viewport);
				                    let mapHeight = viewport.mapHeight.zoom(viewport);

				                    /*****************/
				                    // left-side smooth
				                    if ((viewport.leftTop.x <= ths.maxMouseMoveSmoothOffset) && (viewport.leftTop.x > 0))
					                    ths.smoothMoveTo.x = 0;
				                    // right-side smooth
				                    else if ((viewport.leftTop.x >= viewport.canvas.width - mapWidth - ths.maxMouseMoveSmoothOffset) && (viewport.leftTop.x < viewport.canvas.width - mapWidth))
					                    ths.smoothMoveTo.x = viewport.canvas.width - mapWidth;

				                    /*****************/
				                    // top-side smooth
				                    if ((viewport.leftTop.y <= ths.maxMouseMoveSmoothOffset) && (viewport.leftTop.y > 0))
					                    ths.smoothMoveTo.y = 0;
				                    // bottom-side smooth
				                    else if ((viewport.leftTop.y >= viewport.canvas.height - mapHeight - ths.maxMouseMoveSmoothOffset) && (viewport.leftTop.y < viewport.canvas.height - mapHeight))
					                    ths.smoothMoveTo.y = viewport.canvas.height - mapHeight;

				                    // direction for smoothing vector
				                    ths.smoothMoveDir = ths.smoothMoveTo.minus(viewport.leftTop).mult(1 / ths.smoothSpeedParts).round();
				                    // end point for smoothing
				                    ths.smoothMoveTo = ths.smoothMoveDir.mult(ths.smoothSpeedParts).round().plus(viewport.leftTop);

				                    //start smoothing
				                    ths.smoothMoveInterval = setInterval(function ()
				                                                         {
					                                                         ths.smoothMove();
				                                                         }, ths.smoothPartInterval);
				                    // debug
				                    viewport.debugSections(e.pageX - viewport.offset.left, e.pageY - viewport.offset.top);
			                    }
		                    });

		$(viewport.canvas).mousewheel(function(e, delta)
		                     {
			                     let oldZoom = ths.viewport.zoom;
			                     const zoomChange = (delta > 0) ? 3/2 : 3/4;
			                     ths.viewport.zoom = Math.max(Math.min(ths.viewport.zoom * zoomChange, 3.375), 0.5);
			                     e.stopPropagation();
			                     e.preventDefault();

			                     if(oldZoom != ths.viewport.zoom)
			                     {
			                     	let x = viewport.leftTop.x - (e.pageX - viewport.offset.left - viewport.leftTop.x) * (zoomChange - 1);
			                     	let y = viewport.leftTop.y - (e.pageY - viewport.offset.top - viewport.leftTop.y) * (zoomChange - 1);

				                     ths.changeLeftTop(x, y);
			                     }
		                     });
	}

	changeLeftTop(x, y, withOffset)
	{
		let offset = (withOffset) ? this.maxMouseMoveSmoothOffset : 0;

		let mapWidth = this.viewport.mapWidth.zoom(this.viewport);
		let mapHeight = this.viewport.mapHeight.zoom(this.viewport);

		let maxPosX = (mapWidth > this.viewport.canvas.width) ? this.viewport.canvas.width - mapWidth : 0;
		let maxPosY = (mapHeight > this.viewport.canvas.height) ? this.viewport.canvas.height - mapHeight : 0;

		let minPosX = (mapWidth < this.viewport.canvas.width) ? this.viewport.canvas.width - mapWidth : 0;
		let minPosY = (mapHeight < this.viewport.canvas.height) ? this.viewport.canvas.height - mapHeight : 0;

		// no offset for smoothing when map is smaller than canvas
		let offsetX = (mapWidth > this.viewport.canvas.width) ? offset : 0;
		let offsetY = (mapHeight > this.viewport.canvas.height) ? offset : 0;

		this.viewport.leftTop.x = this.getMouseMove(x, minPosX + offsetX, maxPosX - offsetX);
		this.viewport.leftTop.y = this.getMouseMove(y, minPosY + offsetY, maxPosY - offsetY);

	}

	smoothMove()
	{
		if(this.smoothMoveInterval && this.smoothMoveDir)
		{
			this.viewport.leftTop = this.viewport.leftTop.plus(this.smoothMoveDir);
			if(this.viewport.leftTop.eq(this.smoothMoveTo))
			{
				clearInterval(this.smoothMoveInterval);
				this.smoothMoveInterval = null;
			}
		}
	}

	smoothStop()
	{
		if(this.smoothMoveInterval)
		{
			this.viewport.leftTop = this.smoothMoveTo;
			clearInterval(this.smoothMoveInterval);
			this.smoothMoveInterval = null;
		}
	}

	getMouseMove(a, min, max)
	{
		return Math.max(Math.min(Math.round(a), min), max);
	};
}