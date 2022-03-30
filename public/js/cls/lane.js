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
		for (let i = 1 + this.num; i < this.sections.length; i++)
		{
			let section = this.sections[i];
			let next = i + 1;
			let drawLaneMarking = true;
			let drawLaneSepMarking = true;

			if (section.crossDir) // есть пересечение
			{
				let crossSection = section.crossSection;
				let crossPos = this.sections.length - 1 - i; // с какой с конца секции изгибаем

				if(section.crossDir.eq(section.leftDir)) // поворот налево
				{
					if (crossSection.rightCnt == section.rightCnt) // полоса совпадает
					{
						// при изгибе дороги мы поворачиваем с последней секции - в нулевую, с предпоследней - в первую
						// а при перекрестке  - куда-то не в начало, так и отсекаем перекрестки
						// изгиб должен быть в пределах кол-ва рядов справа от текущей секции и совпадать с позицией секции (если считать с конца)
						if( (crossPos <= section.rightCnt) && (crossPos == crossSection.num) )
						{
							section.calcCornerMarkings();
							drawLaneMarking = false;

							// разделительная разметка между направлениями - рисуем вдоль крайнего левого ряда
							if(section.leftCnt == 0 && crossSection.leftCnt == 0)
							{
								section.calcSepCornerMarkings();
								drawLaneSepMarking = false;
							}

						}
					}

				}
				else if(section.crossDir.eq(section.rightDir)) // поворот направо
				{
					// поворот с крайней правой в крайнюю правую
					if ( (section.rightCnt == 0) && (crossSection.rightCnt == 0) )
					{
						section.calcCornerMarkings();
						drawLaneMarking = false;
					}

					if(crossSection.leftCnt == section.leftCnt) // полоса совпадает
					{
						// изгиб должен быть в пределах кол-ва рядов справа от текущей секции и совпадать с позицией секции (если считать с конца)
						if( (crossPos <= section.leftCnt) && (crossPos == crossSection.num) )
						{
							section.calcCornerMarkings();
							drawLaneMarking = false;

							if(section.leftCnt == 0 && crossSection.leftCnt == 0)
							{
								section.calcSepCornerMarkings();
								drawLaneSepMarking = false;
							}
						}
					}
				}
			}

			if(!section.crossDir || (section.crossSection.num == 0)) // не перекресток
			{
				if(drawLaneMarking)
					section.calcLanesMarkings();

				/*if(section.leftCnt == 0)
				{
					section.calcSepMarkings();
				}*/
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
