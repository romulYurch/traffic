//****************************************
//********LANE CLS************************
//****************************************
import Point2d from "./point2d";
import Section from "./section";

export default class Lane
{
	constructor(params, dir, num, roadNum)
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
		this.roadNum = roadNum;
		//this.dirNum = dir;

		this.width = Math.abs(this.end.x - this.start.x) + this.size;
		this.height = Math.abs(this.end.y - this.start.y) + this.size;

		this.startOffset = new Point2d(-this.size / 2, -this.size / 2);

		//this.laneStartOffset = new Point2d(-this.size/2, -this.size/2);
		//this.laneEndOffset = new Point2d( ( (this.type == "v") ? -1 : 1 )*this.size/2, ( (this.type == "v") ? 1 : -1 )*this.size/2);

		//this.fillStyle = (dir == 1) ? "#FF0000" : "#0000FF";
		this.color2 = (dir == 1) ? "#000088" : "#0000FF";
		this.color1 = (dir == 1) ? "#0000FF" : "#000088";


		this.sections = [];
		this.initSections(params.img);
	}

	//****************************************
	initSections(img)
	{
		let point = this.start;
		let plusdDir = new Point2d(this.dir.x * this.size, this.dir.y * this.size);
		let num = 0;

		while (!point.eq(this.end))
		{
			this.sections.push( new Section( { center : point, size : this.size, dir : this.dir, img : img, laneNum : this.num, roadNum: this.roadNum, num: num++, lane :  this  } ) );
			point = point.plus(plusdDir);
		}
		this.sections.push( new Section( { center : point, size : this.size, dir : this.dir, img : img, laneNum : this.num, roadNum: this.roadNum, num: num, lane :  this  } ) );

		/****************************/
		for (let i = 0; i < this.sections.length; i++)
		{
			if(i)
				this.sections[i].prev = this.sections[i - 1];
			if(i < this.sections.length - 1)
				this.sections[i].next = this.sections[i + 1];
		}
	}
	//****************************************
	draw(ctx)
	{
		//ctx.fillStyle = this.fillStyle;

		let start = this.start.offset(this.startOffset);

		let grad = ctx.createLinearGradient(start.x, start.y, this.width, this.height);
		grad.addColorStop(0, this.color1);
		grad.addColorStop(1, this.color2);
		ctx.fillStyle = grad;

		ctx.fillRect(start.x, start.y, this.width, this.height);
	}
	//****************************************
	drawCentralLane(ctx)
	{
		ctx.strokeStyle = "#0000ff";
		ctx.setLineDash([1, 4]);

		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.stroke();

	}
	//****************************************
	drawSections(viewport)
	{
		for (let i = 0; i < this.sections.length; i++)
			this.sections[i].draw(viewport);
	}
	//****************************************
	drawCrosses(ctx)
	{
		ctx.globalAlpha = 0.2;
		ctx.fillStyle =  "#ff00ff";
		for (let i = 0; i < this.sections.length; i++)
			this.sections[i].drawCrosses(ctx);
		ctx.globalAlpha = 1;

	}
	//****************************************
	drawSectionsMarkings(viewport)
	{
		for (let i = 0; i < this.sections.length; i++)
			this.sections[i].drawMarkings(viewport);
	}
	//****************************************
	calcSectionsMarkings()
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
								this.sections[i].calcLanesMarkings();
						}
						else if(this.sections[i].rightCnt > 1)
							this.sections[i].calcLanesMarkings();
					}
					else //поворачиваем направо
					{
						if(this.sections[i].rightCnt > 1)
							this.sections[i].calcLanesMarkings();
						if(this.sections[i].rightCnt == 1)
							this.sections[i + this.sections[i].rightCnt].calcCorner();
						else if( this.sections[i + this.sections[i].rightCnt].crossSection && (this.sections[i].rightCnt == this.sections[i + this.sections[i].rightCnt].crossSection.rightCnt) )
							this.sections[i + this.sections[i].rightCnt].calcCorner();
					}
				}
			}

			if ( this.sections[i + 1].crossSection ) //если на следующей секции поворот налево
			{
				let crossRightCnt = this.sections[i + 1].crossSection.rightCnt;
				if(crossRightCnt == this.sections[i + 1].rightCnt)
					if( (i + crossRightCnt == this.sections.length - 1) && (this.sections[i + 1].crossSectionNum == crossRightCnt - 1) )
					{
						this.sections[i + 1].calcCorner();
						if(this.sections[i + 1].left && !this.sections[i + 1].left.dir.eq(this.sections[i + 1].dir))
							this.sections[i + 1].calcSepCorner();
					}
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
							this.sections[i].calcSepMarkings();
						else
							this.sections[i + 1].calcSepCorner();
					}
				}
				else if(this.sections[i + 1].crossDir && !this.sections[i + 1].crossInDir && (i + 1 == this.sections.length - 1) && this.sections[i + 1].crossDir.eq(this.sections[i].rightDir) )
				{
					this.sections[i + 1].calcSepCorner();
					this.sections[i].calcSepMarkings();
					this.sections[i + 1].crossSection.next.calcSepMarkings();
				}
			}
		}

		if (!this.sections[0].right && this.sections[0].left && this.sections[0].left.dir.eq(this.sections[0].dir)) //если это потенциальный правый ряд с сужением или расширением
		{
			if(!this.sections[0].prev && this.sections[0].left.prev) //расширение
				this.sections[0].calcNewRightLane(true);
		}
		let last = this.sections.length - 1;
		if (!this.sections[last].right && this.sections[last].left && this.sections[last].left.dir.eq(this.sections[last].dir)) //если это потенциальный правый ряд с сужением или расширением
		{
			if(!this.sections[last].next && this.sections[last].left.next) //сужение
				this.sections[last].calcNewRightLane(false);
		}
	}
	//****************************************
	getSections()
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
	}
}
