//****************************************
//********HELPERS CLS*********************
//****************************************

// 20px = 5m => 4px = 1m => 1px = 0.25m
const pix2m = 0.25;
const pix2km = pix2m/1000;
const km_h2px_s = 1 / (3600 * pix2km);

const frequency = 30; // fps = 1000/frequency

const laneSize = 20;

export default class Helpers
{
	static Rand(min, max)
	{
		return Math.random() * (max - min) + min;
	}

	static get km_h2px_s()
	{
		return km_h2px_s;
	}

	static get frequency()
	{
		return frequency;
	}

	static get laneSize()
	{
		return laneSize;
	}
}