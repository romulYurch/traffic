/*
for (var k = 0; k < roads.length; k++)
{
	for (var i = 0; i < roads[k].dirs[1].lanes.length; j++)
	{
		for (var j = i + 1; j < roads[k].lanes.length; j++)
		{
			if(i != j)
			{
				corner = checkLines(roads[k].lanes[i].start, roads[k].lanes[i].end, roads[k].lanes[j].start, roads[k].lanes[j].end);
				if(corner)
					this.corners.push( { center : corner, lane1 : this.lanes[i], lane2 : this.lanes[j] } );
			}
		}
	}
}*/
/***********************/




function checkLines(s1, e1, s2, e2) // s - start point, e - end
{
	/*
	x1 = s1.x	x2 = e1.x	x3 = s2.x	x4 = e2.x
	y1 = s1.y	y2 = e1.y	y3 = s2.y	y4 = e2.y	
	
	x:=((x1*y2-x2*y1)*(x4-x3)-(x3*y4-x4*y3)*(x2-x1))/((y1-y2)*(x4-x3)-(y3-y4)*(x2-x1));
	y:=((y3-y4)*x-(x3*y4-x4*y3))/(x4-x3);
	
	k1:=(x2-x1)/(y2-y1);
	k2:=(x4-x3)/(y4-y3);
	*/
	if( (e1.y == s1.y) && (e2.y == s2.y) )
		return false;
	else if( (e1.x == s1.x) && (e2.x == s2.x) )
		return false;
	else if( (e1.y != s1.y) && (e2.y != s2.y) )
	{
		var k1 = (e1.y == s1.y) ? -1 : (e1.x - s1.x)/(e1.y - s1.y);
		var k2 = (e2.y == s2.y) ? -1 : (e2.x - s2.x)/(e2.y - s2.y);
		if(k1 == k2)
			return false;
	}
	
	var x = ( (s1.x*e1.y - e1.x*s1.y)*(e2.x - s2.x) - (s2.x*e2.y - e2.x*s2.y)*(e1.x - s1.x) )/( (s1.y - e1.y)*(e2.x - s2.x) - (s2.y - e2.y)*(e1.x - s1.x) );
	var y = ( (s2.y - e2.y)*x - (s2.x*e2.y - e2.x*s2.y) )/(e2.x - s2.x);
	
	if( ( (s1.x <= x) && (e1.x >= x) && (s2.x <= x) && (e2.x >= x) ) || ( (s1.y <= y) && (e1.y >= y) && (s2.y <= y) && (e2.y >= y) ) )
		return new Point2d(x, y);
	return false;
}



