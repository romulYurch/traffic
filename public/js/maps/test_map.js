'use strict';

import Point2d from "../cls/point2d";
import Road from "../cls/road";
import Helpers from "../cls/helpers";

function testRoads(width, height, laneSize, laneImg)
{
	let roads = [], lanes = [], roadDir = [];

	laneSize = laneSize || Helpers.laneSize;
	laneImg = laneImg || document.getElementById("roads_lane");

	/***********<**********/
	lanes.push( { start : new Point2d(laneSize/2, laneSize/2), end : new Point2d(width - laneSize/2, laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(/*laneSize +*/ laneSize/2, laneSize + laneSize/2), end : new Point2d(width /*- laneSize*/ - laneSize/2, laneSize + laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes } );
	lanes = [];
	lanes.push( { start : new Point2d(2*laneSize + laneSize/2, 3*laneSize + laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, 3*laneSize + laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(2*laneSize + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, 2*laneSize + laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********V***********/
	roadDir = []; lanes = [];
	lanes.push( { start : new Point2d(laneSize/2, laneSize/2), end : new Point2d(laneSize/2, height - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(laneSize + laneSize/2, /*laneSize +*/ laneSize/2), end : new Point2d(laneSize + laneSize/2, height /*- laneSize*/ - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	lanes = [];
	lanes.push( { start : new Point2d(3*laneSize + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(3*laneSize + laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(2*laneSize + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(2*laneSize + laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********>***********/
	roadDir = []; lanes = [];
	lanes.push( { start : new Point2d(laneSize/2, height - laneSize/2), end : new Point2d(width - laneSize/2, height - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(/*laneSize +*/ laneSize/2, height - laneSize - laneSize/2), end : new Point2d(width /*- laneSize*/ - laneSize/2, height - laneSize - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	lanes = [];
	lanes.push( { start : new Point2d(2*laneSize + laneSize/2, height - 3*laneSize - laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, height - 3*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(2*laneSize + laneSize/2, height - 2*laneSize - laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********^***********/
	roadDir = []; lanes = [];
	lanes.push( { start : new Point2d(width + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(width + laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(width - laneSize/2, laneSize/2), end : new Point2d(width - laneSize/2, height - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(width - laneSize - laneSize/2, /*laneSize +*/ laneSize/2), end : new Point2d(width - laneSize - laneSize/2, height /*- laneSize*/ - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes } );
	lanes = [];
	lanes.push( { start : new Point2d(width - 3*laneSize - laneSize/2,   2*laneSize + laneSize/2), end : new Point2d(width - 3*laneSize - laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	lanes.push( { start : new Point2d(width - 2*laneSize - laneSize/2,   2*laneSize + laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********^***********/
	/**********^***********/
	roadDir = []; lanes = [];
	lanes.push( { start : new Point2d(width/2 + laneSize/2, laneSize/2), end : new Point2d(width/2 + laneSize/2, 2*height + laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes } );
	lanes = [];
	lanes.push( { start : new Point2d(width/2 - laneSize/2, laneSize/2), end : new Point2d(width/2 - laneSize/2, 2*height + laneSize + laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********^***********/
	roadDir = []; lanes = [];
	lanes.push( { start : new Point2d(laneSize/2, height/2 + laneSize/2), end : new Point2d(3*width + laneSize + laneSize/2, height/2 + laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	lanes = [];
	lanes.push( { start : new Point2d(laneSize/2,  height/2 - laneSize/2), end : new Point2d(3*width + 2*laneSize + laneSize/2, height/2 - laneSize/2), size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********^***********/
	roadDir = []; lanes = [];
	lanes.push( { 	start : new Point2d(3*width + 2*laneSize + laneSize/2, height/2 - laneSize/2),
		            end : 	new Point2d(3*width + 2*laneSize + laneSize/2, 2*height + laneSize + laneSize/2),
		            size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes	} );
	lanes = [];
	lanes.push( { 	start : new Point2d(3*width + laneSize + laneSize/2, height/2 + laneSize/2),
		            end : 	new Point2d(3*width + laneSize + laneSize/2, 2*height + laneSize/2),
		            size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/**********^***********/
	roadDir = []; lanes = [];
	lanes.push( { 	start : new Point2d(width/2 + laneSize/2, 2*height + laneSize/2),
		            end : 	new Point2d(3*width + laneSize + laneSize/2, 2*height + laneSize/2),
		            size : laneSize, img : laneImg } );
	roadDir.push( { dir : -1, lanes : lanes	} );
	lanes = [];
	lanes.push( { 	start : new Point2d(width/2 - laneSize/2, 2*height + laneSize + laneSize/2),
		            end : 	new Point2d(3*width + 2*laneSize + laneSize/2, 2*height + laneSize + laneSize/2),
		            size : laneSize, img : laneImg } );
	roadDir.push( { dir : 1, lanes : lanes } );
	roads.push( new Road(roadDir, roads.length) );
	/*********************/

	return roads;
}

export {testRoads};