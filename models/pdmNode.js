var pdmNode;

function pdmNode(id,duration){
	this.id = id;
	this.dependancies = [];
	this.duration = duration;

	this.children = [];

	this.earlyPair = [-1,-1];
	this.latePair = [-1,-1];
	this.float = -1;
}

pdmNode.prototype.addDependancy = function(node){
	this.dependancies.push(node);
	node.addChild(this);
}

pdmNode.prototype.addChild = function(node){
	this.children.push(node);
}

pdmNode.prototype.isEnd = function(){
	return !this.children || this.children.length <= 0;
}

pdmNode.prototype.hasDependancy = function(){
	return this.dependancies && this.dependancies.length > 0;
}

pdmNode.prototype.getEarlyFinish = function(){
	if (this.earlyPair[0] == -1 || this.earlyPair[1] == -1){
		this.earliest();
	}
	return this.earlyPair[1];
}

pdmNode.prototype.getLateStart = function(latest){
	this.latePair = [-1,-1];
	
	if (this.latePair[0] == -1 || this.latePair[1] == -1){
		this.latest(latest);
	}
	return this.latePair[0];
}

pdmNode.prototype.earliest = function(){
	var late_early = 0;

	for (id in this.dependancies){
		var cur = this.dependancies[id];
		var finish = cur.getEarlyFinish();
		if (finish > late_early){
			late_early = finish;
		}
	}

	this.earlyPair = [late_early,late_early + this.duration];
}

pdmNode.prototype.latest = function(latest){
	var early_late = latest;
	
	for (id in this.children){
		var cur = this.children[id];
		var start = cur.getLateStart(latest);
		if (start < early_late){
			early_late = start;
		}
	}

	this.latePair = [early_late - this.duration, early_late];
}

pdmNode.prototype.getFloat = function(){
	this.float = this.latePair[1] - this.earlyPair[1];

	return this.float;
}

pdmNode.prototype.toString = function(){
	var out = "| "+this.earlyPair[0] + " | " + this.duration +" | " +this.earlyPair[1] + " |\n";
	out += "|     "+this.id+"     |\n";
	out += "| "+this.latePair[0] + " | "+ this.getFloat() + " | "+ this.latePair[1] + " |";
	return out;
}

pdmNode.prototype.toJSON = function(){
	var out = {};
	out.id = this.id;
	out.earlyPair = this.earlyPair;
	out.latePair = this.latePair;
	out.float = this.float;
	out.duration = this.duration;

	out.children = [];
	
	for (id in this.children){
		var child = this.children[id];

		out.children.push(child.id);
	};

	out.dependancies = [];

	for(id in this.dependancies){
		var dep = this.dependancies[id];
		out.dependancies.push(dep.id);
	};

	return out;
}

pdmNode.createNode = function(id,duration){
	return new pdmNode(id,duration);
}

module.exports = pdmNode;
