'use strict';

import Helpers from './cls/helpers';
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
	return this.zoom(viewport) + viewport.LeftTop.x;
};
//****************************************
Number.prototype.toScreenY = function(viewport)
{
	return this.zoom(viewport) + viewport.LeftTop.y;
};

$(function()
{
	let init = function()
	{
		let viewPort = new ViewPort("trafficCanvas", 900, 500);
		viewPort.init(testRoads(viewPort.roadsWidth, viewPort.roadsHeight, Helpers.laneSize, viewPort.laneImg));
	};

	init();
});