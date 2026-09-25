'use strict';

import ViewPort from "./cls/veiwport";
import {testRoads} from "./maps/test_map";

require("jquery-mousewheel");

Number.prototype.zoom = function(viewport)
{
	return this * viewport.zoom;
};
//****************************************
Number.prototype.toScreenX = function(viewport)
{
	return this.zoom(viewport) + viewport.leftTop.x;
};
//****************************************
Number.prototype.toScreenY = function(viewport)
{
	return this.zoom(viewport) + viewport.leftTop.y;
};

$(function()
{
	let init = function()
	{
		let viewPort = new ViewPort("trafficCanvas");
		viewPort.init(testRoads(viewPort.roadsWidth, viewPort.roadsHeight));

		/*let viewPort2 = new ViewPort("trafficCanvas2", {width: 300, height: 300});
		viewPort2.init(testRoads(viewPort2.roadsWidth, viewPort2.roadsHeight));

		let viewPort3 = new ViewPort("trafficCanvas3");
		viewPort3.init(testRoads(viewPort3.roadsWidth, viewPort3.roadsHeight));*/
	};

	init();
});