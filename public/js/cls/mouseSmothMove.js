import Point2d from "./point2d";

export default class MouseSmoothMove
{

	constructor(viewport)
	{
		this.smoothMoveInterval = null;
		this.smoothMoveTo = new Point2d(0, 0);
		this.smoothMoveDir = null;
		this.smoothSpeedParts = 5;
		this.smoothPartInterval = 30;

		this.maxMouseMoveSmoothOffset = 10;
		this.prevMousePos = new Point2d(0, 0);

		this.viewport = viewport;

		let ths = this;
		$(viewport.canvas).mousemove(function(e)
		                    {
			                    if(e.which == 1) //нажата левая кнопка
			                    {
				                    ths.smoothStop();

				                    viewport.LeftTop.x = ths.getMouseMove(viewport.LeftTop.x + e.pageX - ths.prevMousePos.x, ths.maxMouseMoveSmoothOffset, viewport.canvas.width - viewport.mapWidth.zoom(viewport) - ths.maxMouseMoveSmoothOffset);
				                    viewport.LeftTop.y = ths.getMouseMove(viewport.LeftTop.y + e.pageY - ths.prevMousePos.y, ths.maxMouseMoveSmoothOffset, viewport.canvas.height - viewport.mapHeight.zoom(viewport) - ths.maxMouseMoveSmoothOffset);
			                    }
			                    ths.prevMousePos.x = e.pageX;
			                    ths.prevMousePos.y = e.pageY;
		                    });

		$(viewport.canvas).mouseup(function(e)
		                    {
		                  	    if(e.which == 1) //нажата левая кнопка
			                    {
				                    ths.smoothMoveTo = new Point2d(viewport.LeftTop.x, viewport.LeftTop.y);
				                    console.log(ths.smoothMoveTo);

				                    /*****************/
				                    // left-side smooth
				                    if ((viewport.LeftTop.x <= ths.maxMouseMoveSmoothOffset) && (viewport.LeftTop.x > 0))
					                    ths.smoothMoveTo.x = 0;
				                    // right-side smooth
				                    else if ((viewport.LeftTop.x >= viewport.canvas.width - viewport.mapWidth.zoom(viewport) - ths.maxMouseMoveSmoothOffset) && (viewport.LeftTop.x < viewport.canvas.width - viewport.mapWidth.zoom(viewport)))
					                    ths.smoothMoveTo.x = viewport.canvas.width - viewport.mapWidth.zoom(viewport);

				                    /*****************/
				                    // top-side smooth
				                    if ((viewport.LeftTop.y <= ths.maxMouseMoveSmoothOffset) && (viewport.LeftTop.y > 0))
					                    ths.smoothMoveTo.y = 0;
				                    // bottom-side smooth
				                    else if ((viewport.LeftTop.y >= viewport.canvas.height - viewport.mapHeight.zoom(
					                    viewport) - ths.maxMouseMoveSmoothOffset) && (viewport.LeftTop.y < viewport.canvas.height - viewport.mapHeight.zoom(viewport)))
					                    ths.smoothMoveTo.y = viewport.canvas.height - viewport.mapHeight.zoom(viewport);

				                    // direction for smoothing vector
				                    ths.smoothMoveDir = ths.smoothMoveTo.minus(viewport.LeftTop).mult(1 / ths.smoothSpeedParts).round();
				                    // end point for smoothing
				                    ths.smoothMoveTo = ths.smoothMoveDir.mult(ths.smoothSpeedParts).round().plus(viewport.LeftTop);

				                    //start smoothing
				                    ths.smoothMoveInterval = setInterval(function ()
				                                                         {
					                                                         ths.smoothMove();
				                                                         }, ths.smoothPartInterval);
			                    }
		                    });

		$(viewport.canvas).mousewheel(function(e, delta)
		                     {
			                     let oldZoom = ths.viewport.zoom;
			                     const zoomChange = (delta > 0) ? 3/2 : 3/4;
			                     ths.viewport.zoom = Math.max(Math.min(ths.viewport.zoom * zoomChange, 3.375), 1);
			                     e.stopPropagation();
			                     e.preventDefault();

			                     if(oldZoom != ths.viewport.zoom)
			                     {
				                     viewport.LeftTop.x = ths.getMouseMove(viewport.LeftTop.x - (e.pageX - viewport.offset.left - viewport.LeftTop.x) * (zoomChange - 1), 0, viewport.canvas.width - viewport.mapWidth.zoom(viewport));
				                     viewport.LeftTop.y = ths.getMouseMove(viewport.LeftTop.y - (e.pageY - viewport.offset.top - viewport.LeftTop.y) * (zoomChange - 1), 0, viewport.canvas.height - viewport.mapHeight.zoom(viewport));
				                     //debug.innerHTML = Helpers.LeftTop.x + ', ' + Helpers.LeftTop.y;
			                     }
		                     });
	}

	smoothMove()
	{
		if(this.smoothMoveInterval && this.smoothMoveDir)
		{
			this.viewport.LeftTop = this.viewport.LeftTop.plus(this.smoothMoveDir);
			if(this.viewport.LeftTop.eq(this.smoothMoveTo))
				clearInterval(this.smoothMoveInterval);
		}
	}

	smoothStop()
	{
		if(this.smoothMoveInterval)
		{
			this.viewport.LeftTop = this.smoothMoveTo;
			clearInterval(this.smoothMoveInterval);
		}
	}

	getMouseMove(x, min, max)
	{
		return Math.max(Math.min(Math.round(x), min), max);
	};
}