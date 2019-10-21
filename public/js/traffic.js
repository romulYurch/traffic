'use strict';

import Helpers from './cls/helpers';
import Point2d from './cls/point2d';
import Vehicle from './cls/vehicle';
import {testRoads} from './maps/test_map';
import ViewPort from "./cls/veiwport";
import MouseSmoothMove from "./cls/mouseSmothMove";

require("jquery-mousewheel");


let laneTurnImg = null, carImg = [];


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
	const screenWidth = 900;//360;
	const screenHeight = 500;//340;

	const width = 320;
	const height = 320;

	let laneImg = document.getElementById("roads_lane");
	laneTurnImg = document.getElementById("roads_turn");
	carImg.push(document.getElementById("car_01x20"));
	
	let init = function()
	{
		let viewPort = new ViewPort("trafficCanvas", screenWidth, screenHeight);

		let debug = document.getElementById("debug");

		new MouseSmoothMove(viewPort);

		/*********************/
		/*********************/

		let initRoads = function()
		{
			let roads = testRoads(width, height, Helpers.laneSize, laneImg);
			let maxX = 0, maxY = 0;

			/*******************************/
			/********crossroads*************/
			for (let i = 0; i < roads.length; i++)
				for (let j = i + 1; j < roads.length; j++)
				{
					for (let l = 0; l < roads[i].lanes.length; l++)
						for (let k = 0; k < roads[j].lanes.length; k++)
						{
							for (let m = 0; m < roads[i].lanes[l].sections.length; m++)
								for (let n = 0; n < roads[j].lanes[k].sections.length; n++)
								{
									if(roads[i].lanes[l].sections[m].center.eq(roads[j].lanes[k].sections[n].center) /*&& (n < roads[j].lanes[k].sections.length - 1)*/ )
									{
										/**********************************************************/
										/**********с сектора m на сектор n*************************/
										/**********************************************************/
										//проверим, можно ли повернуть в сторону движения ряда
										if(roads[i].lanes[l].sections[m].rightDir.eq(roads[j].lanes[k].sections[n].dir)) //поворот направо
										{
											//зная, сколько еще рядов находится справа, можем узнать, кончается ли дорога перекрестком или нет
											if(n + roads[i].lanes[l].sections[m].rightCnt < roads[j].lanes[k].sections.length) //если есть куда ехать, то это поворот с этого сектора
											{
												roads[i].lanes[l].sections[m].crossDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossSectionNum = n;
												roads[i].lanes[l].sections[m].crossSection = roads[j].lanes[k].sections[n];

												/****************/
												roads[j].lanes[k].sections[n].crossInDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossInLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossInSectionNum = m;
												roads[j].lanes[k].sections[n].crossInSection = roads[i].lanes[l].sections[m];
											}
											else //иначе - это поворот на этот сектор
											{
												roads[i].lanes[l].sections[m].crossInDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossInLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossInSectionNum = n;
												roads[i].lanes[l].sections[m].crossInSection = roads[j].lanes[k].sections[n];

												/***************************/
												roads[j].lanes[k].sections[n].crossDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossSectionNum = m;
												roads[j].lanes[k].sections[n].crossSection = roads[i].lanes[l].sections[m];
											}
										}
										else if(roads[i].lanes[l].sections[m].leftDir.eq(roads[j].lanes[k].sections[n].dir)) //поворот налево
										{
											//зная, сколько еще рядов находится слева, можем узнать, кончается ли дорога перекрестком или нет
											if(n + roads[i].lanes[l].sections[m].leftCnt < roads[j].lanes[k].sections.length) //если есть куда ехать, то это поворот с этого сектора
											{
												roads[i].lanes[l].sections[m].crossDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossSectionNum = n;
												roads[i].lanes[l].sections[m].crossSection = roads[j].lanes[k].sections[n];

												/****************/
												roads[j].lanes[k].sections[n].crossInDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossInLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossInSectionNum = m;
												roads[j].lanes[k].sections[n].crossInSection = roads[i].lanes[l].sections[m];
											}
											else //иначе - это поворот на этот сектор
											{
												roads[i].lanes[l].sections[m].crossInDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossInLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossInSectionNum = n;
												roads[i].lanes[l].sections[m].crossInSection = roads[j].lanes[k].sections[n];

												/***************************/
												roads[j].lanes[k].sections[n].crossDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossSectionNum = m;
												roads[j].lanes[k].sections[n].crossSection = roads[i].lanes[l].sections[m];
											}
										}
										/**********************************************************/
										/**********с сектора n на сектор m*************************/
										/**********************************************************/
										//проверим, можно ли повернуть в сторону движения ряда
										if(roads[j].lanes[k].sections[n].rightDir.eq(roads[i].lanes[l].sections[m].dir)) //поворот направо
										{
											//зная, сколько еще рядов находится справа, можем узнать, кончается ли дорога перекрестком или нет
											if(m + roads[j].lanes[k].sections[n].rightCnt < roads[i].lanes[l].sections.length) //если есть куда ехать, то это поворот с этого сектора
											{
												roads[j].lanes[k].sections[n].crossDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossSectionNum = m;
												roads[j].lanes[k].sections[n].crossSection = roads[i].lanes[l].sections[m];

												/****************/
												roads[i].lanes[l].sections[m].crossInDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossInLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossInSectionNum = n;
												roads[i].lanes[l].sections[m].crossInSection = roads[j].lanes[k].sections[n];
											}
											else //иначе - это поворот на этот сектор
											{
												roads[j].lanes[k].sections[n].crossInDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossInLane =roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossInSectionNum = m;
												roads[j].lanes[k].sections[n].crossInSection = roads[i].lanes[l].sections[m];

												/***************************/
												roads[i].lanes[l].sections[m].crossDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossSectionNum = n;
												roads[i].lanes[l].sections[m].crossSection = roads[j].lanes[k].sections[n];
											}
										}
										else if(roads[j].lanes[k].sections[n].leftDir.eq(roads[i].lanes[l].sections[m].dir)) //поворот налево
										{
											//зная, сколько еще рядов находится слева, можем узнать, кончается ли дорога перекрестком или нет
											if(m + roads[j].lanes[k].sections[n].leftCnt < roads[i].lanes[l].sections.length) //если есть куда ехать, то это поворот с этого сектора
											{
												roads[j].lanes[k].sections[n].crossDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossSectionNum = m;
												roads[j].lanes[k].sections[n].crossSection = roads[i].lanes[l].sections[m];

												/****************/
												roads[i].lanes[l].sections[m].crossInDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossInLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossInSectionNum = n;
												roads[i].lanes[l].sections[m].crossInSection = roads[j].lanes[k].sections[n];
											}
											else //иначе - это поворот на этот сектор
											{
												roads[j].lanes[k].sections[n].crossInDir = roads[i].lanes[l].sections[m].dir;
												roads[j].lanes[k].sections[n].crossInLane = roads[i].lanes[l];
												roads[j].lanes[k].sections[n].crossInSectionNum = m;
												roads[j].lanes[k].sections[n].crossInSection = roads[i].lanes[l].sections[m];

												/***************************/
												roads[i].lanes[l].sections[m].crossDir = roads[j].lanes[k].sections[n].dir;
												roads[i].lanes[l].sections[m].crossLane = roads[j].lanes[k];
												roads[i].lanes[l].sections[m].crossSectionNum = n;
												roads[i].lanes[l].sections[m].crossSection = roads[j].lanes[k].sections[n];
											}
										}
										debug.innerHTML =  "(" + roads[j].lanes[k].sections[n].center.x + "," + roads[j].lanes[k].sections[n].center.y + " - r-" + j + ", l-" + k +", s-" + n + ") = (" + roads[i].lanes[l].sections[m].center.x + "," + roads[i].lanes[l].sections[m].center.y + " - r-" + i + ", l-" + l +", s-" + m + ")<br />" + debug.innerHTML;
										break;
									}
								}
						}
				}

			for (let i = 0; i < roads.length; i++)
				roads[i].calcMarkings();

			/*******************************/
			for (let i = 0; i < roads.length; i++)
			{
				let curDebug = document.getElementById("debug" + i);
				curDebug.innerHTML += "road " + i + "<br />";
				for (let l = 0; l < roads[i].lanes.length; l++)
				{
					curDebug.innerHTML += "lane " + l + "<br />";
					for (let m = 0; m < roads[i].lanes[l].sections.length; m++)
					{
						maxX = Math.max(maxX, roads[i].lanes[l].sections[m].center.x);
						maxY = Math.max(maxY, roads[i].lanes[l].sections[m].center.y);
						curDebug.innerHTML +=  "section " + m + " (" + roads[i].lanes[l].sections[m].center.x + "," + roads[i].lanes[l].sections[m].center.y + ")<br />";
						if (roads[i].lanes[l].sections[m].crossDir)
							curDebug.innerHTML +=  "-> " + roads[i].lanes[l].sections[m].crossSectionNum + " (" + roads[i].lanes[l].sections[m].crossDir.x + "," + roads[i].lanes[l].sections[m].crossDir.y + " | right: " + roads[i].lanes[l].sections[m].rightDir.x + "," + roads[i].lanes[l].sections[m].rightDir.y + " | left: " + roads[i].lanes[l].sections[m].leftDir.x + "," + roads[i].lanes[l].sections[m].leftDir.y + ")<br />";
					}
				}
			}

			// ширина карты расчитывается по максимальным координатам ее дорог
			viewPort.mapWidth = maxX + Helpers.laneSize / 2;
			viewPort.mapHeight = maxY + Helpers.laneSize / 2;

			return roads;
		};
		
		/********************************************/		
		let add_vehicle = function(point)
		{
			if(!point)
				point = new Point2d(10, 10);
			if(point)
			{
				for (let i = 0; i < roads.length; i++)
					for (let j = 0; j < roads[i].lanes.length; j++)
						for (let k = 0; k < roads[i].lanes[j].sections.length; k++)
							if(point.eq(roads[i].lanes[j].sections[k].center))
							{
								vehicles.push(new Vehicle( { img : carImg[0], section : roads[i].lanes[j].sections[k], size : new Point2d(Helpers.laneSize, Helpers.laneSize) } ));
								vehCnt++;
								if( vehicleInterval && (vehCnt > 5) )
									clearInterval(vehicleInterval);
								return true;
							}
			}
			return false;
		};
		/********************************************/

		let updateContent = function()
		{
			let badVeh = [];
			for (let i = 0; i < vehicles.length; i++)
				if(vehicles[i])
				{
					vehicles[i].updatePos();
					if(vehicles[i].unusable)
						badVeh.push(i);
				}
			/********/
			for (let i = 0; i < badVeh.length; i++)
			{
				vehicles.splice(badVeh[i] - i, 1);
				add_vehicle(new Point2d(Helpers.laneSize / 2, Helpers.laneSize / 2));
			}
			/*************************/
			/*************************/
			drawContent();
		};
		/********************************************/

		let drawContent = function()
		{
			clear();
			/*for (let i = 0; i < roads.length; i++)
				roads[i].draw(ctx);*/
			/*for (let i = 0; i < roads.length; i++)
				roads[i].drawCorners(ctx);*/
			for (let i = 0; i < roads.length; i++)
				roads[i].drawSections(viewPort);
			for (let i = 0; i < roads.length; i++)
				roads[i].drawCrosses(viewPort.ctx);
			for (let i = 0; i < roads.length; i++)
				roads[i].drawMarkings(viewPort);
			/**********************************/
			/**********************************/
			for (let i = 0; i < vehicles.length; i++)
				if(vehicles[i])
					vehicles[i].draw(viewPort);
		};
		/********************************************/

		let clear = function()
		{
			viewPort.ctx.clearRect(0, 0, viewPort.ctx.canvas.width, viewPort.ctx.canvas.height);
			viewPort.ctx.fillStyle = "#000000";
			viewPort.ctx.fillRect(0, 0, viewPort.ctx.canvas.width, viewPort.ctx.canvas.height);
		};
		/********************************************/
		let vehicles = [];
		let vehCnt = 0;
		/********************************************/
		let vehicleInterval = setInterval(add_vehicle, 2000);

		let roads = initRoads();
		
		setInterval(updateContent, Helpers.frequency);
	};

	init();
});