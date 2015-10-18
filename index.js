#! /usr/bin/env node
var fs = require("fs");
var path = require("path");
var liner = require("./models/liner");
var pdmTree = require("./models/pdmTree");
var pdmNode = require("./models/pdmNode");

var args = process.argv.slice(2);
var raw_pdms = fs.readFileSync(path.resolve(__dirname,"pdms.json"),"utf8");
var pdms = JSON.parse(raw_pdms);

var commands = ["nw","ad","rm","ls","crp","help"];
var command_detail = {
	"nw":{
		"description":"Create a new pdm tree with the specified name.",
		"args":{
			"name":"Name of the pdm"
		},
		"flags":{
			"-f":"Load pdm from comma-separated file. Provide file name as an argument"
		}
	},
	"ad":{
		"description":"Add a node with given id, duration, and dependencies",
		"args":{
			"pdm_name":"pdm to add this node to",
			"id":"Name of the node",
			"duration":"Duration of this node",
			"dependencies":"Comma separated list of dependency id's"
		}
	},
	"rm":{
		"description":"Remove a node or entire pdm",
		"args":{
			"pdm_name":"name of the pdm to select",
			"id":"Id of the node to remove"
		},
		"flags":{
			"-a":"remove all"
		}
	},
	"ls":{
		"description":"List pdm nodes",
		"args":{
			"pdm_name":"pdm to list, if not present, lists all pdm names"
		}
	},
	"crp":{
		"description":"Print the pritical path nodes of the pdm",
		"args":{
			"pdm_name":"Name of the pdm to analyze"
		}
	},
};

var command = args[0];

switch (command){
	case commands[0]:
		if (args.length < 2){
			console.log("PDM name is required");
			break;
		}

		var nw_name = args[1];

		if (pdms.data[nw_name]){
			console.log("PDM called "+nw_name+" already exists.");
			break;
		}

		var tree = new pdmTree();
		
		if (args[2] === "-f"){

			if (!args[3]){
				console.log("Must provide a file name.");
				break;
			}

			console.log("Loading pdm from "+args[3]);
			
			var source = fs.createReadStream(args[3]);
			source.pipe(liner);
			liner.on("readable",function(){
				var line;
				while (line = liner.read()){
					var node_args = line.split(",");
					var node = new pdmNode(node_args[0],node_args[1]);
					tree.addNode(node,node_args.slice(2));
				}

				pdms.data[nw_name] = tree.toJSON();
				fs.writeFileSync(path.resolve(__dirname,"pdms.json"),JSON.stringify(pdms));
			});


		}else{
		
			pdms.data[nw_name] = tree.toJSON();
			fs.writeFileSync(path.resolve(__dirname,"pdms.json"),JSON.stringify(pdms));
		}

		break;
		
	case commands[1]:
                if (args.length < 4){
	                console.log("PDM name is required");
	                break;
                }

		var name = args[1];
		
		if (!pdms.data[name]){
			console.log("PDM called "+name+" does not exist.");
			break;
		}
		
		var id = args[2];
		var duration = parseInt(args[3]);

		if (!id || !duration){
			console.log("Must specify name and duration for a new node");
			break;
		}
		
		var depIds = [];
		if (args.length > 4){
			depIds = args[4].split(",");
		}
		
		var tree = pdmTree.fromJSON(pdms.data[name]);
		var node = new pdmNode(id,duration);

		tree.addNode(node,depIds);
		
		var raw_tree = tree.toJSON();
		var sorted = pdmTree.topoSort(raw_tree);

		if (!sorted || sorted.length < raw_tree.nodes.length){
			console.log("Adding "+id+" creates a dependency cycle which is not allowed");
			break;
		}
		pdms.data[name] = raw_tree;

		fs.writeFileSync(path.resolve(__dirname,"pdms.json"),JSON.stringify(pdms));
		break;
	case commands[2]:
		if (args.length < 2){
			console.log("Must specify PDM name.");
			break;
		}

		var name = args[1];
		
		if (!pdms.data[name]){
			console.log("PDM with name "+name+" does not exist");
			break;
		}

		var all = false;
		var flags = args.slice(2);
		for (arg in flags){
			if (flags[arg] === "-a"){
				all = true;
				break;
			}
		}

		var id = args[2];
		if (!id){
			console.log("Must provide an id or -a flag");
			break;
		}

		if (all){
			delete pdms.data[name];
			
			console.log("Removed "+name);
		}else{
			console.log("Removed node "+id);
			if (pdms.data[name].nodes[id]){
				delete pdms.data[name].nodes[id];
			}
		}

		fs.writeFileSync(path.resolve(__dirname,"pdms.json"),JSON.stringify(pdms));
		break;
	case commands[3]:
		if (args.length < 2){
			console.log(Object.keys(pdms.data));
			break;
		}

		var name = args[1];

		if (!pdms.data[name]){
			console.log("PDM called " + name + " does not exist.");
			break;
		}
		
		var tree = pdmTree.fromJSON(pdms.data[name]);
		tree.printNodes();
		break;

	case commands[4]:
		if (args.length < 2){
			console.log("PDM name is required.");
			break;
		}

		var name = args[1];

		if (!pdms.data[name]){
			console.log("PDM named "+name+" does not exist.");
			break;
		}

		var tree = pdmTree.fromJSON(pdms.data[name]);

		console.log("Critical path for "+name+":");
		tree.printCriticalPath();

		break;
	case commands[5]:
		console.log(command_detail);
		break;
	default:
		console.log("Unrecognized command, try pdm_cli help for details.");
}

