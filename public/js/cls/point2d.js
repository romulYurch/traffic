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
	return new Point2d(Math.round(this.x * k * 1000) / 1000, Math.round(this.y * k * 1000) / 1000);
};
//****************************************
Point2d.prototype.round = function(digits)
{
	digits = (digits) ? digits : 0;
	let roundDigits = Math.pow(10, digits);

	return new Point2d(Math.round(this.x * roundDigits) / roundDigits, Math.round(this.y * roundDigits) / roundDigits);
};