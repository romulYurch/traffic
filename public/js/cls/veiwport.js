import Point2d from "./point2d";
import MouseSmoothMove from "./mouseSmothMove";
import Helpers from "./helpers";
import Vehicle from "./vehicle";

export default class ViewPort
{
	constructor(canvasID, params)
	{
		params = params || {};

		this.canvas = document.getElementById(canvasID); //
		let $canvas = $(this.canvas);

		this.canvas.width = params.width || $(document).width() - parseInt($canvas.css('margin-left')) - parseInt($canvas.css('margin-right'));
		this.canvas.height = params.height || $(document).height() - parseInt($canvas.css('margin-top')) - parseInt($canvas.css('margin-bottom'));

		this.zoom = params.zoom || 1;

		this.roadsWidth = params.roadsWidth || 320; // to build roads
		this.roadsHeight = params.roadsHeight || 320;

		this.vehiclesParams = params.vehicles || []; // params for vehicles
		this.vehicleMaxCnt = this.vehiclesParams.length || params.vehicleMaxCnt || 5;
		this.vehicleSpown = params.vehicleSpown || new Point2d(10, 10);

		this.carDefaultImg = params.carDefaultImg || document.getElementById("car_01x20");

		/*******************************************************/

		this.ctx = this.canvas.getContext("2d");

		this.offset = $canvas.offset();

		this.vehicles = [];
		this.roads = [];
		this.leftTop = new Point2d(0, 0);
		this.mapWidth = 0; // size of map
		this.mapHeight = 0;

		new MouseSmoothMove(this);
	}

	init(roads)
	{
		let ths = this;
		// get roads
		this.initRoads(roads);

		this.initVehicles();

		// start to work
		setInterval(function ()
		            {
			            ths.updateContent();
		            }, Helpers.frequency);
	}

	clear()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	initRoads(roads)
	{
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
									//debug.innerHTML =  "(" + roads[j].lanes[k].sections[n].center.x + "," + roads[j].lanes[k].sections[n].center.y + " - r-" + j + ", l-" + k +", s-" + n + ") = (" + roads[i].lanes[l].sections[m].center.x + "," + roads[i].lanes[l].sections[m].center.y + " - r-" + i + ", l-" + l +", s-" + m + ")<br />" + debug.innerHTML;
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
			for (let l = 0; l < roads[i].lanes.length; l++)
			{
				for (let m = 0; m < roads[i].lanes[l].sections.length; m++)
				{
					maxX = Math.max(maxX, roads[i].lanes[l].sections[m].center.x);
					maxY = Math.max(maxY, roads[i].lanes[l].sections[m].center.y);
				}
			}
		}

		// ширина карты расчитывается по максимальным координатам ее дорог
		this.mapWidth = maxX + Helpers.laneSize / 2;
		this.mapHeight = maxY + Helpers.laneSize / 2;

		this.roads = roads;
	}

	initVehicles()
	{
		// vehicles data from params
		if(this.vehiclesParams.length)
		{
			for (let i = 0; i < this.vehicleMaxCnt; i++)
				this.addVehicle(this.vehiclesParams[i]);
		}
		else // if no vehicles data then generate them
		{
			let ths = this;
			let vehicleInterval = setInterval(function ()
			                                  {
				                                  ths.addVehicle();

				                                  if( vehicleInterval && (ths.vehicles.length > ths.vehicleMaxCnt) )
					                                  clearInterval(vehicleInterval);
			                                  }, 2000);
		}
	}

	addVehicle(params)
	{
		params = params || {};

		params.img = params.img || this.carDefaultImg;

		params.point = params.point || this.vehicleSpown;

		for (let i = 0; i < this.roads.length; i++)
			for (let j = 0; j < this.roads[i].lanes.length; j++)
				for (let k = 0; k < this.roads[i].lanes[j].sections.length; k++)
					if(params.point.eq(this.roads[i].lanes[j].sections[k].center))
					{
						params.section = this.roads[i].lanes[j].sections[k];

						this.vehicles.push(new Vehicle(params));

						return true;
					}
		return false;
	}

	drawContent()
	{
		this.clear();
		/*for (let i = 0; i < roads.length; i++)
			roads[i].draw(ctx);*/
		/*for (let i = 0; i < roads.length; i++)
			roads[i].drawCorners(ctx);*/
		for (let i = 0; i < this.roads.length; i++)
			this.roads[i].drawSections(this);
		for (let i = 0; i < this.roads.length; i++)
			this.roads[i].drawCrosses(this.ctx);
		for (let i = 0; i < this.roads.length; i++)
			this.roads[i].drawMarkings(this);
		/**********************************/
		/**********************************/
		for (let i = 0; i < this.vehicles.length; i++)
			if(this.vehicles[i])
				this.vehicles[i].draw(this);
	}


	updateContent()
	{
		let badVeh = [];
		for (let i = 0; i < this.vehicles.length; i++)
			if(this.vehicles[i])
			{
				this.vehicles[i].updatePos();
				if(this.vehicles[i].unusable)
					badVeh.push(i);
			}
		/********/
		for (let i = 0; i < badVeh.length; i++)
		{
			this.vehicles.splice(badVeh[i] - i, 1);
			this.addVehicle(new Point2d(Helpers.laneSize / 2, Helpers.laneSize / 2));
		}
		/*************************/
		/*************************/
		this.drawContent();
	}
}