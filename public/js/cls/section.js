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
		this.drawImg(ctx, laneSize, laneSize * this.markingCorner.imgLeft.type, this.markingCorner.imgLeft.pos.x, this.markingCorner.imgLeft.pos.y);
	else if(!this.markingCorner || !this.markingCorner.imgLeft)
	{
		if(!this.crossInSection || this.prev)
		{
			let start = this.center.plus(new Point2d(-this.size / 2, -this.size / 2));
			this.drawImg(ctx, 0, 0, start.x, start.y);
		}
	}
	else if(this.markingCorner.imgLeft)
		this.drawImg(ctx, laneSize, laneSize * this.markingCorner.imgLeft.type, this.markingCorner.imgLeft.pos.x, this.markingCorner.imgLeft.pos.y);
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
	this.drawMoveTo(ctx, line.from);
	this.drawLineTo(ctx, line.to);
	ctx.stroke();
};
//****************************************
Section.prototype.drawCorner = function(turn, ctx)
{
	if(turn.imgRight)
		this.drawImg(ctx, 0, laneSize * turn.imgRight.type, turn.imgRight.pos.x, turn.imgRight.pos.y);

	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 2;
	ctx.setLineDash( turn.lineDash );

	ctx.beginPath();
	this.drawMoveTo(ctx, turn.from);
	this.drawArcTo(ctx, turn.corner, turn.to, turn.rad);
	ctx.stroke();
};
//****************************************
Section.prototype.drawImg = function(ctx, sourceX, sourceY, outX, outY)
{
	ctx.drawImage(this.img,
	              sourceX, sourceY, this.size, this.size,
	              outX.toScreenX(), outY.toScreenY(), this.size * zoom, this.size * zoom);
};
//****************************************
Section.prototype.drawMoveTo = function(ctx, point)
{
	point = point.toDraw();
	ctx.moveTo(point.x, point.y);
};
//****************************************
Section.prototype.drawLineTo = function(ctx, point)
{
	point = point.toDraw();
	ctx.lineTo(point.x, point.y);
};
//****************************************
Section.prototype.drawArcTo = function(ctx, pointFrom, pointTo, radius)
{
	pointFrom = pointFrom.toDraw();
	pointTo = pointTo.toDraw();
	ctx.arcTo(pointFrom.x, pointFrom.y, pointTo.x, pointTo.y, radius * zoom);
};
//****************************************
Section.prototype.calcLanesMarkings = function()
{
	this.markingRight = { from : this.markingRightStart, to : this.markingRightEnd, lineDash : (this.right) ? [5] : []  };
};
//****************************************
Section.prototype.calcSepMarkings = function()
{
	this.markingLeft = { from : this.markingLeftStart, to : this.markingLeftEnd, lineDash : [] };
};
//****************************************
Section.prototype.calcNewRightLane = function(ctx, start)
{
	this.newRightLaneStart = start;
	this.newRightLaneEnd = !start;

	let from = null, corner = null, to = null, rad = null, imgLeft = {};

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
Section.prototype.calcCorner = function()
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