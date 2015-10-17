var pdmNode = require("./pdmNode.js");

function pdmTree(){
	this.nodes = {};
	this.latest = 0;
}

pdmTree.fromJSON = function(json){
	var tree = new pdmTree();
	tree.latest = json.latest;
	
	var nodes = json.nodes;
	for (id in nodes){
		var jNode = nodes[id];
		if (!jNode){
			continue;
		}

		var depIds = jNode.dependancies;

		var node = new pdmNode(jNode.id,jNode.duration);

		tree.addNode(node,depIds);

	}
	
	var late = 0;
	for (id in tree.nodes){
		var node = tree.nodes[id];

		this.latest = node.getEarlyFinish();
                
                if (late > this.latest){
	                this.latest = late;
                }
	}

	for (id in tree.nodes){
		var node = tree.nodes[id];

		node.getLateStart(this.latest);
	}


	return tree;
}

pdmTree.prototype.addNode = function(node,depIds){
	if (this.nodes[node.id]){
		//console.log("Node with id "+node.id+" already exists.");
		var cur_deps = [];
		if (node.dependencies){
			node.dependencies.filter(function(dep){
				return dep.id;
			});
		}

		depIds.concat(cur_deps);
	}

	for (id in depIds){
		var cur = depIds[id];
		
		if (this.nodes[cur]){
			node.addDependancy(this.nodes[cur]);
		}else{
			//console.log("Error adding node, dependancy with id "+cur+" does not exist.");
			//return;
			var unknown = new pdmNode(cur,0);
			this.addNode(unknown);
			node.addDependancy(unknown);
		}

	}
	this.nodes[node.id] = node;
}

pdmTree.prototype.toJSON = function(){
	var out = {};

	out.latest = this.latest;
	out.nodes = {};	
	for (id in this.nodes){
		var node = this.nodes[id];
		
		out.nodes[id] = node.toJSON();
	};

	return out;
}

pdmTree.prototype.printNodes = function(){
	for (id in this.nodes){
		if (this.nodes[id]){
			console.log(this.nodes[id].toString());
		}
	}
}

pdmTree.prototype.printCriticalPath = function(){
	var end = this.findCriticalEnd();
	var criticalPath = this.getCriticalPath(end);

	var string = "";
	for (node in criticalPath){
		string += criticalPath[node] ;
		if (node < criticalPath.length -1){
			string+="->";
		}
	}

	console.log(string);
	
}

pdmTree.prototype.getCriticalPath = function(node){
	if (!node.hasDependancy()){
		var path = [node.id];
		return path;
	}

	for (id in node.dependancies){
		
		if (node.dependancies[id].getFloat() === 0){	
			var path = this.getCriticalPath(node.dependancies[id]);
			path.push(node.id);
			return path;
		}
	}
}

pdmTree.prototype.findCriticalEnd = function(){
	for (id in this.nodes){
		var node = this.nodes[id];
		var float = node.getFloat();	
		if (node && node.isEnd() && float == 0){
			return node;
		}
	}
	
	return false;
}

pdmTree.topoSort = function(json){
	
	var sorted = [];
	var nodes = JSON.parse(JSON.stringify(json.nodes));
	for (id in nodes){
		var node = nodes[id];
		for (dId in node.dependencies){
			for (sId in sorted){
				if (node.dependancies[dId] === sorted[sId]){
					node.dependancies.splice(dId,1);
					dId--;
					break;
				}
			}
		}
		
		if (!node.dependancies || node.dependancies.length == 0){
			sorted.push(node.id);
			
		}
	}
	
}

module.exports = pdmTree;
