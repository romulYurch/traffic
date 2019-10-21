/***********************************/
/*********VEHICLE CLS***************/
/***********************************/
import Helpers from "./helpers";
import Point2d from "./point2d";

export default class Vehicle
{
	constructor(params)
	{
		this.img = params.img;

		this.maxSpeed = params.speed ? params.speed : Helpers.Rand(45, 60) * Helpers.km_h2px_s; // 15 - 20 km/h
		this.speed = this.maxSpeed;
		//this.freqSpeed = frequency / 30;
		this.fps = 1000 / Helpers.frequency;
		//this.realSpeed = this.freqSpeed * this.speed;
		this.speedPerFrame = this.speed / this.fps;

		this.curNeededSpeed = 0;

		this.section = params.section;
		this.pos = new Point2d(this.section.center.x, this.section.center.y);
		this.curPos = new Point2d(this.pos.x, this.pos.y);
		this.dir = this.section.dir;
		this.type = 3;

		this.sensRadius = 8;
		this.acceleration = Helpers.Rand(100 / 15, 100 / 10) * Helpers.km_h2px_s; // t = 15 & 10 sec - time to reach 100 km/h
		this.deceleration = Helpers.Rand(100 / 10, 100 / 5) * Helpers.km_h2px_s;

		this.size = params.size;

		this.crossSections = []; // stack of sections to change dir
		this.sensSection = null; // section at the border of sensitivity radius

		this.init();
		this.updateDir();

		this.debug = true;

		this.unusable = false;
	}

	/***********************************/
	init()
	{
		let section = this.section;
		for (let i = 0; i < this.sensRadius; i++)
		{
			if( section.crossSection && ( !section.next || (Math.random() > 0.8) ) )
			{
				this.sensSection = section.crossSection;
				this.crossSections.push( { section : this.sensSection, distance : i * this.size } );
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
	}

	/***********************************/
	getDistance2turn(crossSection)
	{
		let section = (this.crossSections.length) ? this.crossSections[this.crossSections.length - 1].section.next : this.section.next;

		for (let i = 0; i < this.sensRadius; i++)
		{
			if(section.crossSection == crossSection)
				return (i + 1) * this.size;
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
	}

	/***********************************/
	draw(viewport)
	{
		if(this.debug)
		{
			if(this.sensSection)
			{
				viewport.ctx.strokeStyle = "#0000ff";
				this.drawRect(viewport, this.sensSection.center.x - this.sensSection.size / 2, this.sensSection.center.y - this.sensSection.size / 2);
			}
			if(this.section)
			{
				viewport.ctx.strokeStyle = "#ff0000";
				this.drawRect(viewport, this.section.center.x - this.section.size / 2, this.section.center.y - this.section.size / 2);
			}

			for(let i = 0, len = this.crossSections.length; i < len; i++)
			{
				viewport.ctx.strokeStyle = "#00ff00";
				this.drawRect(viewport, this.crossSections[i].section.center.x - this.crossSections[i].section.size / 2, this.crossSections[i].section.center.y - this.crossSections[i].section.size / 2);
			}
		}
		/*******************/
		//ctx.drawImage(this.img, 0, this.size * this.type, this.size.x, this.size.y, (this.pos.x - this.section.size/2)*zoom + leftTop.x,  (this.pos.y - this.section.size/2) * zoom + leftTop.y, this.size.x * zoom, this.size.y * zoom);
		this.drawImg(viewport, 0, this.size.y * this.type, this.pos.x - this.section.size / 2,  this.pos.y - this.section.size / 2);
		/*******************/
		if(this.debug)
		{
			viewport.ctx.fillStyle = "#00ff00";
			viewport.ctx.font = "10px Arial";
			viewport.ctx.fillText(Math.round(this.speed / Helpers.km_h2px_s) + ',' + ( (this.crossSections.length) ? Math.round(this.curNeededSpeed / Helpers.km_h2px_s) + ' - ' + Math.round(this.crossSections[0].distance) : '?' ),
			             (this.pos.x - 7).toScreenX(viewport), (this.pos.y - 8).toScreenY(viewport));
		}
	}

	//****************************************
	drawRect (viewport, sourceX, sourceY)
	{
		viewport.ctx.strokeRect(sourceX.toScreenX(viewport),
		                        sourceY.toScreenY(viewport),
		                        this.size.x.zoom(viewport),
		                        this.size.y.zoom(viewport));

	}

	//****************************************
	drawImg (viewport, sourceX, sourceY, outX, outY)
	{
		viewport.ctx.drawImage(this.img,
		                        sourceX, sourceY, this.size.x, this.size.y,
		                        outX.toScreenX(viewport), outY.toScreenY(viewport), this.size.x.zoom(viewport), this.size.y.zoom(viewport));
	}

	/***********************************/
	updatePos()
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
		let crossSpeed = 10 * Helpers.km_h2px_s; // 10 km/h


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
	}
	/***********************************/
	updateDir()
	{
		if(this.section.dir.x == 1)
			this.type = 2;
		else if(this.section.dir.x == -1)
			this.type = 0;
		else if(this.section.dir.y == 1)
			this.type = 3;
		else if(this.section.dir.y == -1)
			this.type = 1;
	}
}
