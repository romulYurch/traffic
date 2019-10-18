'use strict';

import Lane from "./lane";

export default class Road
{
	constructor(dirs)
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
	}

	initSectionSiblings()
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
	}
	//****************************************
	calcSectionSiblingsCnt()
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
	}
	//****************************************
	draw(ctx)
	{
		//lanes
		for (let i in this.dirs)
			for (let j = 0; j < this.dirs[i].lanes.length; j++)
			{
				this.dirs[i].lanes[j].draw(ctx);
			}
	}
	//****************************************
	calcMarkings(ctx)
	{
		//Markings
		for (let i in this.dirs)
			for (let j = 0; j < this.dirs[i].lanes.length; j++)
			{
				this.dirs[i].lanes[j].calcSectionsMarkings(ctx);
			}
	}
	//****************************************
	drawMarkings(ctx)
	{
		for (let i in this.dirs)
			for (let j = 0; j < this.dirs[i].lanes.length; j++)
			{
				this.dirs[i].lanes[j].drawSectionsMarkings(ctx);
			}
	}
	//****************************************
	drawCentralLane(ctx)
	{
		//CentralLane - dotted
		for (let i in this.dirs)
			for (let j = 0; j < this.dirs[i].lanes.length; j++)
			{
				this.dirs[i].lanes[j].drawCentralLane(ctx);
			}
	}
	//****************************************
	drawSections(ctx)
	{
		for (let i in this.dirs)
			for (let j = 0; j < this.dirs[i].lanes.length; j++)
			{
				this.dirs[i].lanes[j].drawSections(ctx);
			}
	}
	//****************************************
	drawCrosses(ctx)
	{
		for (let i in this.dirs)
			for (let j = 0; j < this.dirs[i].lanes.length; j++)
			{
				this.dirs[i].lanes[j].drawCrosses(ctx);
			}
	}
}

