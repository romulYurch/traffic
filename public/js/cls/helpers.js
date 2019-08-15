//****************************************
//********HELPERS CLS*********************
//****************************************
class Helpers
{
	static Random = function(min, max)
	{
		return Math.random() * (max - min) + min;
	};
}