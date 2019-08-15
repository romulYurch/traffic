let laneTurnImg = null, carImg = [];
// 20px = 5m => 4px = 1m => 1px = 0.25m
const pix2m = 0.25;
const pix2km = pix2m/1000;
const km_h2px_s = 1/(3600*pix2km);
let leftTop = new Point2d(0, 0),
	prevMousePos = new Point2d(0, 0);

let zoom = 1;
const frequency = 30; // fps = 1000/frequency

const laneSize = 20;

$(function()
{
	const width = 320;
	const height = 320;
	const mapWidth = 1040;//360;
	const mapHeight = 700;//340;

	let maxMouseMoveOffset = 10;

	let laneImg = document.getElementById("roads");
	laneTurnImg = document.getElementById("roads_turn");
	carImg.push(document.getElementById("car_01x20"));
	
	let init = function()
	{
		
		let canvas = document.getElementById("trafficCanvas");
		let offset = $(canvas).offset();
		
		let ctx = canvas.getContext("2d");
		let debug = document.getElementById("debug");	

		let smoothMoveInterval = null;
		let smoothMoveTo = new Point2d(0, 0);
		let smoothMoveDir = null;
		
		let mouseMoveStart = null;
		
		let smoothMove  = function()
		{
			if(smoothMoveInterval && smoothMoveDir)
			{
				leftTop = leftTop.plus(smoothMoveDir);
				if(leftTop.eq(smoothMoveTo))
					clearInterval(smoothMoveInterval);
			}
		};
		
		$(canvas).mousemove(function(e)
		{
			if(e.which == 1) //нажата левая кнопка
			{
				if(!mouseMoveStart)	
					mouseMoveStart = new Point2d(leftTop.x, leftTop.y);
				leftTop.x = setMouseMoveX(leftTop.x + e.pageX - prevMousePos.x, maxMouseMoveOffset, canvas.width - mapWidth*zoom - maxMouseMoveOffset);
				leftTop.y = setMouseMoveY(leftTop.y + e.pageY - prevMousePos.y, maxMouseMoveOffset, canvas.height - mapHeight*zoom - maxMouseMoveOffset);
				//debug.innerHTML = (leftTop.x) + ', ' + (leftTop.y);
			}
			prevMousePos.x = e.pageX;
			prevMousePos.y = e.pageY;
		});
		
		$(canvas).click(function()
		{			
			smoothMoveTo = new Point2d(leftTop.x, leftTop.y);
			/*****************/	
			if( (leftTop.x <= maxMouseMoveOffset) && (leftTop.x > 0) )
				smoothMoveTo.x = 0;
			else if( (leftTop.x >= canvas.width - mapWidth*zoom - maxMouseMoveOffset) && (leftTop.x < canvas.width - mapWidth*zoom) )
				smoothMoveTo.x = canvas.width - mapWidth*zoom;
			else
				smoothMoveTo.x = setMouseMoveX(leftTop.x + (leftTop.x - mouseMoveStart.x)/2, 0, canvas.width - mapWidth*zoom);
			/*****************/	
			if( (leftTop.y <= maxMouseMoveOffset) && (leftTop.y > 0) )
				smoothMoveTo.y = 0;
			else if( (leftTop.y >= canvas.height - mapHeight*zoom - maxMouseMoveOffset) && (leftTop.y < canvas.height - mapHeight*zoom) )
				smoothMoveTo.y = canvas.height - mapHeight*zoom;
			else
				smoothMoveTo.y = setMouseMoveY(leftTop.y + (leftTop.y - mouseMoveStart.y)/2, 0, canvas.height - mapHeight*zoom);
			
			smoothMoveDir = smoothMoveTo.minus(leftTop).mult(1/5).round();
			smoothMoveTo = smoothMoveDir.mult(5).round().plus(leftTop);

			mouseMoveStart = null;
			
			smoothMoveInterval = setInterval(smoothMove, 30);
		});
		
		$(canvas).mousewheel(function(e, delta)
		{
			let oldZoom = zoom;
			const zoomChange = (delta > 0) ? 3/2 : 3/4;
			zoom = Math.max(Math.min(zoom*zoomChange, 3.375), 1);
			e.stopPropagation();
			e.preventDefault();

			if(oldZoom != zoom)
			{
				leftTop.x = setMouseMoveX(leftTop.x - (e.pageX - offset.left - leftTop.x)*(zoomChange - 1), 0, canvas.width - mapWidth*zoom);// - prevMousePos.x;
				leftTop.y = setMouseMoveY(leftTop.y - (e.pageY - offset.top - leftTop.y)*(zoomChange - 1), 0, canvas.height - mapHeight*zoom);// - prevMousePos.y;
				debug.innerHTML = leftTop.x + ', ' + leftTop.y;
			}
		});
		
		let setMouseMoveX = function(x, min, max)
		{
			return Math.max(Math.min(Math.round(x), min), max);
		};
		let setMouseMoveY = function(y, min, max)
		{
			return Math.max(Math.min(Math.round(y), min), max);
		};
		
		
		/*********************/
		/*********************/
		let roads = [], lanes = [], roadDir = [];

		let initRoads = function()
		{
			/***********<**********/
			lanes.push( { start : new Point2d(laneSize/2, laneSize/2), end : new Point2d(width - laneSize/2, laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(/*laneSize +*/ laneSize/2, laneSize + laneSize/2), end : new Point2d(width /*- laneSize*/ - laneSize/2, laneSize + laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes } );
			lanes = [];
			lanes.push( { start : new Point2d(2*laneSize + laneSize/2, 3*laneSize + laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, 3*laneSize + laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(2*laneSize + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, 2*laneSize + laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********V***********/
			roadDir = lanes = [];
			lanes.push( { start : new Point2d(laneSize/2, laneSize/2), end : new Point2d(laneSize/2, height - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(laneSize + laneSize/2, /*laneSize +*/ laneSize/2), end : new Point2d(laneSize + laneSize/2, height /*- laneSize*/ - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			lanes = [];
			lanes.push( { start : new Point2d(3*laneSize + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(3*laneSize + laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(2*laneSize + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(2*laneSize + laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********>***********/
			roadDir = lanes = [];
			lanes.push( { start : new Point2d(laneSize/2, height - laneSize/2), end : new Point2d(width - laneSize/2, height - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(/*laneSize +*/ laneSize/2, height - laneSize - laneSize/2), end : new Point2d(width /*- laneSize*/ - laneSize/2, height - laneSize - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			lanes = [];
			lanes.push( { start : new Point2d(2*laneSize + laneSize/2, height - 3*laneSize - laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, height - 3*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(2*laneSize + laneSize/2, height - 2*laneSize - laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********^***********/
			roadDir = lanes = [];
			lanes.push( { start : new Point2d(width + laneSize/2, 2*laneSize + laneSize/2), end : new Point2d(width + laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(width - laneSize/2, laneSize/2), end : new Point2d(width - laneSize/2, height - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(width - laneSize - laneSize/2, /*laneSize +*/ laneSize/2), end : new Point2d(width - laneSize - laneSize/2, height /*- laneSize*/ - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes } );
			lanes = [];
			lanes.push( { start : new Point2d(width - 3*laneSize - laneSize/2,   2*laneSize + laneSize/2), end : new Point2d(width - 3*laneSize - laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			lanes.push( { start : new Point2d(width - 2*laneSize - laneSize/2,   2*laneSize + laneSize/2), end : new Point2d(width - 2*laneSize - laneSize/2, height - 2*laneSize - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********^***********/
			/**********^***********/
			roadDir = lanes = [];
			lanes.push( { start : new Point2d(width/2 + laneSize/2, laneSize/2), end : new Point2d(width/2 + laneSize/2, 2*height + laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes } );
			lanes = [];
			lanes.push( { start : new Point2d(width/2 - laneSize/2, laneSize/2), end : new Point2d(width/2 - laneSize/2, 2*height + laneSize + laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********^***********/
			roadDir = lanes = [];
			lanes.push( { start : new Point2d(laneSize/2, height/2 + laneSize/2), end : new Point2d(3*width + laneSize + laneSize/2, height/2 + laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			lanes = [];
			lanes.push( { start : new Point2d(laneSize/2,  height/2 - laneSize/2), end : new Point2d(3*width + 2*laneSize + laneSize/2, height/2 - laneSize/2), size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********^***********/
			roadDir = lanes = [];
			lanes.push( { 	start : new Point2d(3*width + 2*laneSize + laneSize/2, height/2 - laneSize/2),
				            end : 	new Point2d(3*width + 2*laneSize + laneSize/2, 2*height + laneSize + laneSize/2),
				            size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes	} );
			lanes = [];
			lanes.push( { 	start : new Point2d(3*width + laneSize + laneSize/2, height/2 + laneSize/2),
				            end : 	new Point2d(3*width + laneSize + laneSize/2, 2*height + laneSize/2),
				            size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/**********^***********/
			roadDir = lanes = [];
			lanes.push( { 	start : new Point2d(width/2 + laneSize/2, 2*height + laneSize/2),
				            end : 	new Point2d(3*width + laneSize + laneSize/2, 2*height + laneSize/2),
				            size : laneSize, img : laneImg } );
			roadDir.push( { dir : -1, lanes : lanes	} );
			lanes = [];
			lanes.push( { 	start : new Point2d(width/2 - laneSize/2, 2*height + laneSize + laneSize/2),
				            end : 	new Point2d(3*width + 2*laneSize + laneSize/2, 2*height + laneSize + laneSize/2),
				            size : laneSize, img : laneImg } );
			roadDir.push( { dir : 1, lanes : lanes } );
			roads.push( new Road(roadDir) );
			/*********************/

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
				roads[i].calcMarkings(ctx);

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
						curDebug.innerHTML +=  "section " + m + " (" + roads[i].lanes[l].sections[m].center.x + "," + roads[i].lanes[l].sections[m].center.y + ")<br />";
						if (roads[i].lanes[l].sections[m].crossDir)
							curDebug.innerHTML +=  "-> " + roads[i].lanes[l].sections[m].crossSectionNum + " (" + roads[i].lanes[l].sections[m].crossDir.x + "," + roads[i].lanes[l].sections[m].crossDir.y + " | right: " + roads[i].lanes[l].sections[m].rightDir.x + "," + roads[i].lanes[l].sections[m].rightDir.y + " | left: " + roads[i].lanes[l].sections[m].leftDir.x + "," + roads[i].lanes[l].sections[m].leftDir.y + ")<br />";
					}
				}
			}

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
								vehicles.push(new Vehicle( { img : carImg[0], section : roads[i].lanes[j].sections[k], size : new Point2d(laneSize, laneSize) } ));
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
				add_vehicle(new Point2d(laneSize/2, laneSize/2));
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
				roads[i].drawSections(ctx);
			for (let i = 0; i < roads.length; i++)
				roads[i].drawCrosses(ctx);
			for (let i = 0; i < roads.length; i++)
				roads[i].drawMarkings(ctx);
			/**********************************/
			/**********************************/
			for (let i = 0; i < vehicles.length; i++)
				if(vehicles[i])
					vehicles[i].draw(ctx);
		};
		/********************************************/

		let clear = function()
		{
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.fillStyle = "#000000";
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		};
		/********************************************/
		let vehicles = [];
		let vehCnt = 0;
		/********************************************/
		let vehicleInterval = setInterval(add_vehicle, 2000);

		initRoads();
		
		setInterval(updateContent, frequency);
	};

	init();
});

//****************************************
//****************************************
//****************************************
function getRandomArbitary(min, max)
{
	return Math.random() * (max - min) + min;
}
/********************/
/*Object.prototype.clone = function() 
{
    let newObj = (this instanceof Array) ? [] : {};
    for (i in this) 
	{
        if (i == 'clone') 
			continue;
        if ( this[i] && (typeof this[i] == "object") )
			newObj[i] = this[i].clone();
        else 
			newObj[i] = this[i]
    } 
	return newObj;
};*/