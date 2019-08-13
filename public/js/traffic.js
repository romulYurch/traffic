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
		
		/********************************************/		
		function add_vehicle(point)
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
								if( interval && (vehCnt > 5) )
									clearInterval(interval);
								return true;
							}
			}
			return false;
		}
		/********************************************/
		let vehicles = [];
		let vehCnt = 0;
		let interval = setInterval(add_vehicle, 2000);
		add_vehicle();
		/********************************************/
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
		/******************/
		let clear = function()
		{
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.fillStyle = "#000000";
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		};	
		
		setInterval(updateContent, frequency);
	};
	init();
});

/***********************************/
/*********VEHICLE CLS***************/
/***********************************/
function Vehicle(params)
{
	this.img = params.img;

	this.maxSpeed = params.speed ? params.speed : getRandomArbitary(45, 60) * km_h2px_s; // 15 - 20 km/h
	this.speed = this.maxSpeed;
	//this.freqSpeed = frequency / 30;
	this.fps = 1000 / frequency;
	//this.realSpeed = this.freqSpeed * this.speed;
	this.speedPerFrame = this.speed / this.fps;

	this.curNeededSpeed = 0;

	this.section = params.section;	
	this.pos = new Point2d(this.section.center.x, this.section.center.y);
	this.curPos = new Point2d(this.pos.x, this.pos.y);	
	this.dir = this.section.dir;
	this.type = 3;
	
	this.sensRadius = 8;
	this.acceleration = getRandomArbitary(100 / 15, 100 / 10) * km_h2px_s; // t = 15 & 10 sec - time to reach 100 km/h
	this.deceleration = getRandomArbitary(100 / 10, 100 / 5) * km_h2px_s;
	
	this.size = params.size;	

	this.crossSections = []; // stack of sections to change dir
	this.sensSection = null; // section at the border of sensitivity radius
	
	this.init();
	this.updateDir();
	
	this.debug = true;
		
	this.unusable = false;
	
	return this;
}
/***********************************/
Vehicle.prototype.init = function()
{
	let section = this.section;
	for (let i = 0; i < this.sensRadius; i++)
	{
		if( section.crossSection && ( !section.next || (Math.random() > 0.8) ) )
		{
			this.sensSection = section.crossSection;
			this.crossSections.push( { section : this.sensSection, distance : i*laneSize } );
			section = section.crossSection.next;
		}
		else if(section.next)
		{
			section = section.next;
			this.sensSection = section;
		}
		else if(section.left) //end of tha additional line
		{
			section = section.left;
			this.sensSection = section;
		}
		else if(section.right) //end of tha additional line
		{
			section = section.right;
			this.sensSection = section;
		}
		else
		{
			this.unusable = true;
			return;
		}
	}
	//alert(this.crossSection)
};
/***********************************/
Vehicle.prototype.getDistance2turn = function(crossSection)
{
	let section = (this.crossSections.length) ? this.crossSections[this.crossSections.length - 1].section.next : this.section.next;
	
	for (let i = 0; i < this.sensRadius; i++)
	{
		if(section.crossSection == crossSection)
			return (i + 1)*laneSize;
		if(section.next)
			section = section.next;
		else if(section.left) //end of tha additional line
			section = section.left;
		else if(section.right) //end of tha additional line
			section = section.right;
		else
			return 0;
	}
	
	return 0;
};
/***********************************/
Vehicle.prototype.draw = function(ctx)
{
	if(this.debug)
	{
		if(this.sensSection)
		{
			ctx.strokeStyle = "#0000ff";
			ctx.strokeRect((this.sensSection.center.x - this.sensSection.size/2)*zoom + leftTop.x, (this.sensSection.center.y - this.sensSection.size/2)*zoom + leftTop.y, laneSize*zoom, laneSize*zoom);
		}
		if(this.section)
		{
			ctx.strokeStyle = "#ff0000";
			ctx.strokeRect((this.section.center.x - this.section.size/2)*zoom + leftTop.x, (this.section.center.y - this.section.size/2)*zoom + leftTop.y, laneSize*zoom, laneSize*zoom);
		}
		
		for(let i = 0, len = this.crossSections.length; i < len; i++)
		{
			ctx.strokeStyle = "#00ff00";
			ctx.strokeRect((this.crossSections[i].section.center.x - this.crossSections[i].section.size/2)*zoom + leftTop.x, (this.crossSections[i].section.center.y - this.crossSections[i].section.size/2)*zoom + leftTop.y, laneSize*zoom, laneSize*zoom);
		}
	}
	/*******************/
	ctx.drawImage(this.img, 0, laneSize*this.type, this.size.x, this.size.y, (this.pos.x - this.section.size/2)*zoom + leftTop.x,  (this.pos.y - this.section.size/2)*zoom + leftTop.y, this.size.x*zoom, this.size.y*zoom);
	/*******************/
	if(this.debug)
	{
		ctx.fillStyle = "#00ff00";
		ctx.font = "10px Arial";
		ctx.fillText(Math.round(this.speed/km_h2px_s) + ',' + ( (this.crossSections.length) ? Math.round(this.curNeededSpeed/km_h2px_s) + ' - ' + Math.round(this.crossSections[0].distance) : '?' ), 
					(this.pos.x - 7)*zoom + leftTop.x, (this.pos.y - 8)*zoom + leftTop.y);
	}
};
/***********************************/
Vehicle.prototype.updatePos = function()
{
	if(this.section.center.between(this.curPos, this.curPos.plus(this.dir.mult(this.speedPerFrame))))
	{
		if( this.sensSection.crossSection && ( !this.sensSection.next || (Math.random() > 0.8) ) ) // decision to change direction by random with big chance to go straight
		{
			this.sensSection = this.sensSection.crossSection;
			this.crossSections.push({ section : this.sensSection, distance : this.getDistance2turn(this.sensSection) } );
		}
		
		if(this.sensSection.next)
			this.sensSection = this.sensSection.next;
		else if(this.sensSection.left) //end of tha additional line
			this.sensSection = this.sensSection.left;
		else if(this.sensSection.right) //end of tha additional line
			this.sensSection = this.sensSection.right;
		
		if( this.section.crossSection && this.crossSections[0] && (this.crossSections[0].section == this.section.crossSection) ) // change direction
		{
			this.curPos = new Point2d(this.section.center.x, this.section.center.y);			
			this.section = this.section.crossSection.next;
			this.crossSections.splice(0, 1); //remove the nearest crossSection
			this.dir = this.section.dir;//.mult(this.realSpeed);
			this.updateDir();
		}
		else if(this.section.next)
			this.section = this.section.next;
		else if(this.section.left) //end of tha additional line
		{
			this.section = this.section.left;
			this.dir = this.section.dir;
			this.curPos = this.section.center.minus(this.dir.mult(this.speedPerFrame));
		}
		else if(this.section.right) //end of tha additional line
		{
			this.section = this.section.right;
			this.dir = this.section.dir;
			this.curPos = this.section.center.minus(this.dir.mult(this.speedPerFrame));
		}
		else
		//if(!this.section.next && !this.section.crossSection)
		{
			this.unusable = true;
			return;
		}
	}
	
	let dir = this.dir.mult(this.speedPerFrame);
	let crossSpeed = 10*km_h2px_s; // 10 km/h
	
	
	//let distance2brake = (Math.pow(this.speed, 2) - Math.pow(0.5, 2))/this.deceleration; // 0.5 = 15 km/h
	
	this.curPos	= this.curPos.plus(dir);
	this.pos = this.curPos.round(3);
	if(this.crossSections.length)
	{
		this.crossSections[0].distance -= Math.abs(dir.x) + Math.abs(dir.y);
		this.curNeededSpeed = Math.sqrt(Math.pow(crossSpeed, 2) + 2 * this.crossSections[0].distance * this.deceleration);
		
		if(this.speed >= this.curNeededSpeed)
		{
			this.speed = Math.max(crossSpeed, this.speed - this.deceleration / this.fps);
			//this.realSpeed = this.freqSpeed*this.speed;
			this.speedPerFrame = this.speed / this.fps;
		}
		else
		{
			this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration / this.fps);
			this.speedPerFrame = this.speed / this.fps;
		}
			//this.deceleration
	}
	else
	{
		this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration / this.fps);
		this.speedPerFrame = this.speed / this.fps;
	}
	//document.getElementById("debug").innerHTML = "(" + this.pos.x + ", " + this.pos.y + ") " + document.getElementById("debug").innerHTML;
};
/***********************************/
Vehicle.prototype.updateDir = function()
{
	if(this.section.dir.x == 1)
		this.type = 2;
	else if(this.section.dir.x == -1)
		this.type = 0;
	else if(this.section.dir.y == 1)
		this.type = 3;
	else if(this.section.dir.y == -1)
		this.type = 1;
};
//****************************************
//**********ROAD CLS**********************
//****************************************
function Road(dirs)
{
	this.dirs = {};
	this.lanes = [];
	for (let i = 0; i < dirs.length; i++)
	{
		let lanes = [];		
		let lane = {};
		for (let j = 0; j < dirs[i].lanes.length; j++)
		{			
			lane = new Lane(dirs[i].lanes[j], dirs[i].dir, j);
			lanes.push(lane);
			this.lanes.push(lane);
		}
		this.dirs[dirs[i].dir] = { lanesCnt : lanes.length, lanes : lanes };
	}
	
	this.initSectionSiblings();	
	/***********************/
	return this;
}
//****************************************
Road.prototype.initSectionSiblings = function()
{
	for (let i = 0; i < this.lanes.length; i++)
		for (let k = 0; k < this.lanes[i].sections.length; k++)
		{
			for (let j = i + 1; j < this.lanes.length; j++)
				for (let l = 0; l < this.lanes[j].sections.length; l++)
				{
					if(this.lanes[i].sections[k].isRightSibling(this.lanes[j].sections[l])) // right sibling
					{
						this.lanes[i].sections[k].right = this.lanes[j].sections[l];
						
						if(this.lanes[i].sections[k].dir.eq(this.lanes[j].sections[l].dir)) //if the same dir -> right change to left
							this.lanes[j].sections[l].left = this.lanes[i].sections[k];
						else
							this.lanes[j].sections[l].right = this.lanes[i].sections[k];
						break;
					}					
					else if(this.lanes[i].sections[k].isLeftSibling(this.lanes[j].sections[l])) //left sibling
					{
						this.lanes[i].sections[k].left = this.lanes[j].sections[l];
						
						if(this.lanes[i].sections[k].dir.eq(this.lanes[j].sections[l].dir))  //if the same dir -> left change to right
							this.lanes[j].sections[l].right = this.lanes[i].sections[k];
						else
							this.lanes[j].sections[l].left = this.lanes[i].sections[k];
						break;
					}
				}
		}
	this.calcSectionSiblingsCnt();
};
//****************************************
Road.prototype.calcSectionSiblingsCnt = function()
{
	for (let i = 0; i < this.lanes.length; i++)
		for (let k = 0; k < this.lanes[i].sections.length; k++)
		{
			let rightLane = this.lanes[i].sections[k].right;
			let rightLaneCnt = 1;
			while(rightLane != null)
			{
				rightLaneCnt++;
				rightLane = rightLane.right;
			}
			
			this.lanes[i].sections[k].rightCnt = rightLaneCnt;
			
			/**********************/
			let leftLane = this.lanes[i].sections[k].left;
			let leftLaneCnt = 1;
			let curDir = this.lanes[i].sections[k].dir; //направление ряда, с которого проверяется поворот
			while(leftLane != null)
			{
				leftLaneCnt++;
				if(curDir.eq(leftLane.dir)) //если направление то же, считаем полосы слева
					leftLane = leftLane.left;
				else // как только начали считать встречку, берем полосы справа
					leftLane = leftLane.right;
			}
			
			this.lanes[i].sections[k].leftCnt = leftLaneCnt;
		}
};
//****************************************
Road.prototype.draw = function(ctx)
{
	//lanes
	for (let i in this.dirs)
		for (let j = 0; j < this.dirs[i].lanes.length; j++)
		{
			this.dirs[i].lanes[j].draw(ctx);
		}
};
//****************************************
Road.prototype.calcMarkings = function(ctx)
{
	//Markings
	for (let i in this.dirs)
		for (let j = 0; j < this.dirs[i].lanes.length; j++)
		{
			this.dirs[i].lanes[j].calcSectionsMarkings(ctx);	
		}
};
//****************************************
Road.prototype.drawMarkings = function(ctx)
{
	for (let i in this.dirs)
		for (let j = 0; j < this.dirs[i].lanes.length; j++)
		{
			this.dirs[i].lanes[j].drawSectionsMarkings(ctx);	
		}
};
//****************************************
Road.prototype.drawCentralLane = function(ctx)
{	
	//CentralLane - dotted
	for (let i in this.dirs)
		for (let j = 0; j < this.dirs[i].lanes.length; j++)
		{
			this.dirs[i].lanes[j].drawCentralLane(ctx);
		}
};
//****************************************
Road.prototype.drawSections = function(ctx)
{	
	for (let i in this.dirs)
		for (let j = 0; j < this.dirs[i].lanes.length; j++)
		{
			this.dirs[i].lanes[j].drawSections(ctx);
		}
};
//****************************************
Road.prototype.drawCrosses = function(ctx)
{	
	for (let i in this.dirs)
		for (let j = 0; j < this.dirs[i].lanes.length; j++)
		{
			this.dirs[i].lanes[j].drawCrosses(ctx);
		}
};

//****************************************
//********LANE CLS************************
//****************************************
function Lane(params, dir, num)
{		
	this.type = (params.start.x == params.end.x) ? "v" : "h";
	if( (this.type == "v") && (params.start.y < params.end.y) && (dir == 1) ||
		(this.type == "h") && (params.start.x < params.end.x) && (dir == 1)	)
	{
		this.start = params.start;
		this.end = params.end;
	}
	else
	{
		this.start = params.end;
		this.end = params.start;
	}
	
	this.dir = new Point2d( (this.type == "v") ? 0 : dir, (this.type == "v") ? dir : 0 );
	this.size = params.size;
	this.num = num;
	//this.dirNum = dir;
	
	this.width = Math.abs(this.end.x - this.start.x) + this.size;
	this.height = Math.abs(this.end.y - this.start.y) + this.size;
	
	this.startOffset = new Point2d(-this.size/2, -this.size/2);
	
	//this.laneStartOffset = new Point2d(-this.size/2, -this.size/2);
	//this.laneEndOffset = new Point2d( ( (this.type == "v") ? -1 : 1 )*this.size/2, ( (this.type == "v") ? 1 : -1 )*this.size/2);
	
	//this.fillStyle = (dir == 1) ? "#FF0000" : "#0000FF";
	this.color2 = (dir == 1) ? "#000088" : "#0000FF";
	this.color1 = (dir == 1) ? "#0000FF" : "#000088";
	
	
	this.sections = [];
	this.initSections(params.img);
	
	return this;
}
//****************************************
Lane.prototype.initSections = function(img)
{	
	let point = this.start;
	let plusdDir = new Point2d(this.dir.x*this.size, this.dir.y*this.size);
	let num = 0;
	
	while (!point.eq(this.end))
	{
		this.sections.push( new Section( { center : point, size : this.size, dir : this.dir, img : img, laneNum : this.num, num: num++, lane :  this  } ) );
		point = point.plus(plusdDir);
	}
	this.sections.push( new Section( { center : point, size : this.size, dir : this.dir, img : img, laneNum : this.num, num: num++, lane :  this  } ) );
	
	/****************************/
	for (let i = 0; i < this.sections.length; i++)
	{
		if(i)
			this.sections[i].prev = this.sections[i - 1];
		if(i < this.sections.length - 1)
			this.sections[i].next = this.sections[i + 1];		
	}
};
//****************************************
Lane.prototype.draw = function(ctx)
{
	//ctx.fillStyle = this.fillStyle;
	
	let start = this.start.offset(this.startOffset);
	
	let grad = ctx.createLinearGradient(start.x, start.y, this.width, this.height);
	grad.addColorStop(0, this.color1);
	grad.addColorStop(1, this.color2);
	ctx.fillStyle = grad;
	
	ctx.fillRect(start.x, start.y, this.width, this.height);
};
//****************************************
Lane.prototype.drawCentralLane = function(ctx)
{	
	ctx.strokeStyle = "#0000ff";
	ctx.setLineDash([1, 4]);
	
	ctx.beginPath();
	ctx.moveTo(this.start.x, this.start.y);
	ctx.lineTo(this.end.x, this.end.y);
	ctx.stroke();

};
//****************************************
Lane.prototype.drawSections = function(ctx)
{	
	for (let i = 0; i < this.sections.length; i++)
		this.sections[i].draw(ctx);
};
//****************************************
Lane.prototype.drawCrosses = function(ctx)
{		
	ctx.globalAlpha = 0.2;
	ctx.fillStyle =  "#ff00ff";
	for (let i = 0; i < this.sections.length; i++)
		this.sections[i].drawCrosses(ctx);
	ctx.globalAlpha = 1;

};
//****************************************
Lane.prototype.drawSectionsMarkings = function(ctx)
{
	for (let i = 0; i < this.sections.length; i++)
		this.sections[i].drawMarkings(ctx);
};
//****************************************
Lane.prototype.calcSectionsMarkings = function(ctx)
{
	for (let i = 1; i < this.sections.length - 1; i++)
	{
		let endCrossesLanesCnt = (this.sections[i].crossSection && this.sections[i].right) ? this.sections[i].crossSection.rightCnt : 0;
		let startCrossesLanesCnt = (this.sections[i].crossInSection && this.sections[i].right) ? this.sections[i].crossInSection.rightCnt : 0;
		
		if( (i > startCrossesLanesCnt) && (i < this.sections.length - endCrossesLanesCnt) )
		{
			if ( (this.sections[i].crossDir == null) || ( this.sections[i].crossDir.eq(this.sections[i].leftDir) && 
					(this.sections[i].crossSection.num == this.sections[i].rightCnt - 1) ) ) // если с этого сектора не поворачиваем или поворачиваем налево
			{
				if ( (this.sections[i + 1].crossDir == null) || (this.sections[i + 1].crossDir.eq(this.sections[i].leftDir)) ) //и не поворачиваем на следующем или поворачиваем налево
				{
					if ( (this.sections[i - 1].crossInDir == null) || (this.sections[i - 1].crossInDir.eq(this.sections[i].rightDir)) // и с другого сектора не повернули на предыдущий или повернули, выполняя левый поворот
						|| ( (this.sections[i - 1].crossInSectionNum == this.sections[i - 1].rightCnt - 1) && (this.sections[i - 1].crossInDir.eq(this.sections[i].leftDir)) ) )  // или же это сектор Т-образный перекрестка
					{
						if( (this.sections[i].crossInDir == null) || (this.sections[i].crossInDir.eq(this.sections[i].rightDir)) // и на текущий сектор не повернули или повернули, выполняя левый поворот
							|| ( (this.sections[i].crossInSectionNum == this.sections[i].rightCnt - 1) && (this.sections[i].crossInDir.eq(this.sections[i].leftDir)) ) ) // или же это сектор Т-образный перекрестка
								this.sections[i].calcLanesMarkings(ctx);	
					}					
					else if(this.sections[i].rightCnt > 1)
						this.sections[i].calcLanesMarkings(ctx);
				}
				else //поворачиваем направо
				{
					if(this.sections[i].rightCnt > 1)
						this.sections[i].calcLanesMarkings(ctx);
					if(this.sections[i].rightCnt == 1)
						this.sections[i + this.sections[i].rightCnt].calcCorner(ctx);
					else if( this.sections[i + this.sections[i].rightCnt].crossSection && (this.sections[i].rightCnt == this.sections[i + this.sections[i].rightCnt].crossSection.rightCnt) )
						this.sections[i + this.sections[i].rightCnt].calcCorner(ctx);
				}
			}
		}
		
		if ( this.sections[i + 1].crossSection ) //если на следующей секции поворот налево
		{		
			let crossRightCnt = this.sections[i + 1].crossSection.rightCnt;
			if(crossRightCnt == this.sections[i + 1].rightCnt)
				if( (i + crossRightCnt == this.sections.length - 1) && (this.sections[i + 1].crossSectionNum == crossRightCnt - 1) )
					this.sections[i + 1].calcCorner(ctx);
		}
		/**************************************************************************************/
		/**************************************************************************************/		
		if(	this.sections[i].left && !this.sections[i].left.dir.eq(this.sections[i].dir) ) //если это полоса крайняя слева
		{
			if (!this.sections[i].crossDir && !this.sections[i].crossInDir) 
			{
				if(!this.sections[i - 1].crossInDir || this.sections[i - 1].crossInDir.eq(this.sections[i].leftDir))
				{
					if(!this.sections[i + 1].crossDir || this.sections[i + 1].crossDir.eq(this.sections[i].rightDir))
						this.sections[i].calcSepMarkings(ctx);
					else 
						this.sections[i + 1].calcSepCorner(ctx);
				}
			}
			else if(this.sections[i + 1].crossDir && !this.sections[i + 1].crossInDir && (i + 1 == this.sections.length - 1) && this.sections[i + 1].crossDir.eq(this.sections[i].rightDir) )
			{
				this.sections[i + 1].calcSepCorner(ctx);
				this.sections[i].calcSepMarkings(ctx);
				this.sections[i + 1].crossSection.next.calcSepMarkings(ctx);
			}
		}		
	}
		
	if (!this.sections[0].right && this.sections[0].left && this.sections[0].left.dir.eq(this.sections[0].dir)) //если это потенциальный правый ряд с сужением или расширением
	{		
		if(!this.sections[0].prev && this.sections[0].left.prev) //расширение
			this.sections[0].calcNewRightLane(ctx, true);
	}	
	let last = this.sections.length - 1;
	if (!this.sections[last].right && this.sections[last].left && this.sections[last].left.dir.eq(this.sections[last].dir)) //если это потенциальный правый ряд с сужением или расширением
	{		
		if(!this.sections[last].next && this.sections[last].left.next) //сужение
			this.sections[last].calcNewRightLane(ctx, false);
	}
};
//****************************************
Lane.prototype.getSections = function()
{
	let sections = [];
	let point = this.start;
	let plusdDir = (this.start.x == this.end.x) ? new Point2d(1, 0) : new Point2d(0, 1);
	let num = 0;
	
	while (!point.eq(this.end))
	{
		sections.push( new Section( { center : point, size : this.size, dir : this.dir, num: num++ } ) );
		point = point.plus(plusdDir);
	}
	
	return sections;
};
//****************************************
//*********SECTION CLS********************
//****************************************
function Section(params)
{
	this.center = params.center; //central point
	this.size = params.size; //section size (width = height)
	this.dir = params.dir; //direction of lane
	this.img = params.img; //bg img section
	this.laneNum = params.laneNum; //number of lane
	this.num = params.num; //number in lane
	this.lane = params.lane; //parent lane
	
	this.maxSpeed = 2; // 1px/sec = 30km/h => maxSpeed = 60km/h
	
	/******uses to calc right and left directions******/
	let corner = (this.dir.x) ? Math.acos(this.dir.x) : Math.asin(this.dir.y);
	let markRightDir = new Point2d(Math.round(Math.cos(corner + Math.PI*3/4)), Math.round(Math.sin(corner + Math.PI*3/4)));
	let markLeftDir = new Point2d(Math.round(Math.cos(corner - Math.PI*3/4)), Math.round(Math.sin(corner - Math.PI*3/4)));
	
	/*******normalized right and left directions******/
	this.rightDir = new Point2d(Math.round(Math.cos(corner + Math.PI/2)), Math.round(Math.sin(corner + Math.PI/2)));
	this.leftDir = this.rightDir.mult(-1);
	
	/********marking right side***********************/
	this.markingRightStart = this.center.plus(markRightDir.mult(this.size/2).plus(this.leftDir));
	this.markingRightEnd = this.markingRightStart.plus(this.dir.mult(this.size));
	
	/********marking left side************************/
	this.markingLeftStart = this.center.plus(markLeftDir.mult(this.size/2).plus(this.rightDir));
	this.markingLeftEnd = this.markingLeftStart.plus(this.dir.mult(this.size));
	
	/********calculated markings width crosses and turns****/
	this.markingLeft = null;
	this.markingRight = null;
	this.markingSepCorner = null;
	this.markingCorner = null;
	
	/*******cross out lane*********************************/
	this.crossDir = null; // cross section direction
	this.crossLane = null; // cross section lane
	this.crossSectionNum = null; // cross section position in lane
	this.crossSection = null; // cross section
	
	/*******cross in lane*********************************/
	this.crossInDir = null; // 
	this.crossInLane = null; // 
	this.crossInSectionNum = null; // 
	this.crossInSection = null; // 
	
	/*******additional lane*******************************/
	this.newRightLaneStart = false; // 
	this.newRightLaneEnd = false; // 
	
	/*******sibling sections***************************/	
	this.right = null; // right sibling section at this road
	this.left = null; // left sibling section at this road
	this.next = null; // next sibling section at this road
	this.prev = null; // prev sibling section at this road
	
	/*******offroad lanes cnt***************************/	
	this.rightCnt = 0; // lanes to rightside
	this.leftCnt = 0; // lanes to leftside
	
	return this;
}
//****************************************
Section.prototype.isRightSibling = function(section)
{
	return this.center.plus(this.rightDir.mult(this.size)).eq(section.center);
};
//****************************************
Section.prototype.isLeftSibling = function(section)
{
	return this.center.plus(this.leftDir.mult(this.size)).eq(section.center);
};
//****************************************
Section.prototype.draw = function(ctx)
{
	if(this.newRightLaneStart || this.newRightLaneEnd)
		ctx.drawImage(this.img, laneSize, laneSize*this.markingCorner.imgLeft.type, this.size, this.size, this.markingCorner.imgLeft.pos.x*zoom + leftTop.x, this.markingCorner.imgLeft.pos.y*zoom + leftTop.y, this.size*zoom, this.size*zoom);
	else if(!this.markingCorner || !this.markingCorner.imgLeft)
	{
		if(!this.crossInSection || this.prev)
		{
			let start = this.center.plus(new Point2d(-this.size/2, -this.size/2));
			//ctx.drawImage(this.img, start.x, start.y);
			ctx.drawImage(this.img, 0, 0, this.size, this.size, start.x*zoom + leftTop.x, start.y*zoom + leftTop.y, this.size*zoom, this.size*zoom);
		}
	}
	else if(this.markingCorner.imgLeft)
		ctx.drawImage(this.img, laneSize, laneSize*this.markingCorner.imgLeft.type, this.size, this.size, this.markingCorner.imgLeft.pos.x*zoom + leftTop.x, this.markingCorner.imgLeft.pos.y*zoom + leftTop.y, this.size*zoom, this.size*zoom);
};
//****************************************
Section.prototype.drawMarkings = function(ctx)
{	
	if(this.markingRight)
		this.drawMarkingLine(this.markingRight, ctx);
		
	if(this.markingLeft)
		this.drawMarkingLine(this.markingLeft, ctx);
		
	if(this.markingSepCorner)
		this.drawCorner(this.markingSepCorner, ctx);
		
	if(this.markingCorner)
		this.drawCorner(this.markingCorner, ctx);
};
//****************************************
Section.prototype.drawMarkingLine = function(line, ctx)
{	
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 2;	
	ctx.setLineDash(line.lineDash);

	ctx.beginPath();
	ctx.moveTo(line.from.x*zoom + leftTop.x, line.from.y*zoom + leftTop.y);
	ctx.lineTo(line.to.x*zoom + leftTop.x, line.to.y*zoom + leftTop.y);
	ctx.stroke();
};
//****************************************
Section.prototype.drawCorner = function(turn, ctx)
{		
	if(turn.imgRight)
		//ctx.drawImage(laneTurnImg, turn.imgPos.x, turn.imgPos.y);
		ctx.drawImage(this.img, 0, laneSize*turn.imgRight.type, this.size, this.size, turn.imgRight.pos.x*zoom + leftTop.x, turn.imgRight.pos.y*zoom + leftTop.y, this.size*zoom, this.size*zoom);
	
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 2;
	ctx.setLineDash( turn.lineDash );
	
	ctx.beginPath();
	ctx.moveTo(turn.from.x*zoom + leftTop.x, turn.from.y*zoom + leftTop.y);  
	ctx.arcTo(turn.corner.x*zoom + leftTop.x, turn.corner.y *zoom+ leftTop.y, turn.to.x*zoom + leftTop.x, turn.to.y*zoom + leftTop.y, turn.rad*zoom);
	ctx.stroke();
};
//****************************************
Section.prototype.calcLanesMarkings = function(ctx)
{	
	this.markingRight = { from : this.markingRightStart, to : this.markingRightEnd, lineDash : (this.right) ? [5] : []  };
};
//****************************************
Section.prototype.calcSepMarkings = function(ctx)
{	
	this.markingLeft = { from : this.markingLeftStart, to : this.markingLeftEnd, lineDash : [] };
};
//****************************************
Section.prototype.calcNewRightLane = function(ctx, start)
{	
	//alert(start)
	this.newRightLaneStart = start;
	this.newRightLaneEnd = !start;
	
	let from = null, corner = null, to = null, imgLeft = {};
	
	imgLeft['pos'] = this.center.minus(new Point2d(this.size/2, this.size/2));
	
	if(start)
	{
		from = this.markingLeftStart;
		corner = this.markingRightStart;
		to = this.markingRightEnd;
		rad = this.size;		
						
		if(this.dir.x == 1)
			imgLeft['type'] = 4;
		else if(this.dir.x == -1)
			imgLeft['type'] = 2;
		else if(this.dir.y == 1)
			imgLeft['type'] = 1;
		else if(this.dir.y == -1)
			imgLeft['type'] = 3;
	}
	else
	{
		from = this.markingRightStart;
		corner = this.markingRightEnd;
		to = this.markingLeftEnd;
		rad = this.size;
						
		if(this.dir.x == 1)
			imgLeft['type'] = 3;
		else if(this.dir.x == -1)
			imgLeft['type'] = 1;
		else if(this.dir.y == 1)
			imgLeft['type'] = 4;
		else if(this.dir.y == -1)
			imgLeft['type'] = 2;
	}
	
	this.markingCorner = { from : from, corner : corner, to : to, rad : rad, imgLeft : imgLeft, lineDash : [] };
};
//****************************************
Section.prototype.calcCorner = function(ctx)
{	
	if (this.crossDir != null)
	{
		let from = null, corner = null, to = null, imgLeft = null, imgRight = null, rad = 0, cornType = 0;
		
		if(this.crossDir.eq(this.leftDir))
		{
			from = this.markingRightStart;
			corner = this.markingRightEnd;
			to = this.crossSection.markingRightEnd;
			rad = this.size;
			
			if( !this.next && !this.crossSection.prev)
			{
				imgLeft = {};
				imgLeft['pos'] = this.center.minus(new Point2d(this.size/2, this.size/2));
								
				if(this.dir.x == 1)
					imgLeft['type'] = 3;
				else if(this.dir.x == -1)
					imgLeft['type'] = 1;
				else if(this.dir.y == 1)
					imgLeft['type'] = 4;
				else if(this.dir.y == -1)
					imgLeft['type'] = 2;
			}
		}
		else
		{			
			from = this.prev.markingRightStart;
			corner = this.prev.markingRightEnd;
			/*if(!this.crossSection.next)
				return;*/
			to = this.crossSection.next.markingRightEnd;
			rad = this.size + 2;
			if(!this.right)
			{
				let angle = (this.crossSection.dir.x) ? Math.acos(this.crossSection.dir.x) : Math.asin(this.crossSection.dir.y);
				let centerDir = new Point2d(Math.round(Math.cos(angle + Math.PI/4)), Math.round(Math.sin(angle + Math.PI/4)));
				imgRight = {};
				imgRight['pos'] = this.center.plus(centerDir.mult(this.size)).minus(new Point2d(this.size/2, this.size/2));
				
				if(this.dir.x == 1)
					imgRight['type'] = 2;
				else if(this.dir.x == -1)
					imgRight['type'] = 4;
				else if(this.dir.y == 1)
					imgRight['type'] = 3;
				else if(this.dir.y == -1)
					imgRight['type'] = 1;
			}
		}
		
		this.markingCorner = { from : from, corner : corner, to : to, rad : rad, imgLeft : imgLeft, imgRight : imgRight, lineDash : (this.rightCnt > 1) ? [4] : [] };
	}
};
//****************************************
Section.prototype.calcSepCorner = function(ctx)
{	
	if (this.crossDir)
	{
		let from = null, corner = null, to = null, rad = 0;
		
		if(this.crossDir.eq(this.leftDir))
		{
			from = this.prev.markingLeftStart;
			corner = this.prev.markingLeftEnd;
			to = this.crossSection.next.markingLeftEnd;
			rad = this.size + 2;
		}
		else
		{
			from = this.markingLeftStart;
			corner = this.markingLeftEnd;
			to = this.crossSection.markingLeftEnd;
			rad = this.size;
		}
		
		this.markingSepCorner = { from : from, corner : corner, to : to, rad : rad, lineDash : [] };
	}
};
//****************************************
Section.prototype.drawCrosses = function(ctx)
{	
	return false;
	let start = this.center.plus(new Point2d(-this.size/2, -this.size/2));
	if(this.crossDir)
	{
		//ctx.globalAlpha = 0.2;
		ctx.fillStyle =  "#ff00ff";
		ctx.fillRect(start.x, start.y, this.size, this.size);
	}
	
	if(this.crossInDir)
	{
		//ctx.globalAlpha = 0.2;
		ctx.fillStyle =  "#ff0000";
		ctx.fillRect(start.x, start.y, this.size, this.size);
	}
	//ctx.globalAlpha = 1;
};
//****************************************
//********POINT2D CLS*********************
//****************************************
function Point2d(x, y)
{
	this.x = x;
	this.y = y;
	return this;
}
//****************************************
Point2d.prototype.offset = function(offset)
{
	return { x : this.x + offset.x, y : this.y + offset.y };
};
//****************************************
Point2d.prototype.eq = function(comparePoint)
{
	return ( (this.x == comparePoint.x) && (this.y == comparePoint.y) )
};
//****************************************
Point2d.prototype.between = function(comparePoint1, comparePoint2)
{
	if(comparePoint1.x == comparePoint2.x)
	{
		let y1 = Math.min(comparePoint1.y, comparePoint2.y);
		let y2 = Math.max(comparePoint1.y, comparePoint2.y);
		return (this.y >= y1) && (this.y <= y2);
	}
	else if(comparePoint1.y == comparePoint2.y)
	{
		let x1 = Math.min(comparePoint1.x, comparePoint2.x);
		let x2 = Math.max(comparePoint1.x, comparePoint2.x);
		return (this.x >= x1) && (this.x <= x2);
	}
	
	return false;
};
//****************************************
Point2d.prototype.plus = function(point)
{
	return new Point2d(this.x + point.x, this.y + point.y);
};
//****************************************
Point2d.prototype.minus = function(point)
{
	return new Point2d(this.x - point.x, this.y - point.y);
};
//****************************************
Point2d.prototype.mult = function(k)
{
	return new Point2d(Math.round(this.x*k*1000)/1000, Math.round(this.y*k*1000)/1000);
};
//****************************************
Point2d.prototype.round = function(digits)
{
	digits = (digits) ? digits : 0;
	return new Point2d(Math.round(this.x*Math.pow(10, digits)/Math.pow(10, digits)), Math.round(this.y*Math.pow(10, digits))/Math.pow(10, digits));
};
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