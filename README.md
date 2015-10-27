# PDM Command Line Interface

Installation: 
  > make sure you've installed the latest version of nodejs and npm.
  > in this project's root directory, run `npm link`
  > the alias "pdm_cli" should now work on the command line

Install package:
  > run `npm install --global pdm_cli

Running the Test:
  > Make sure you're in the directory with test.pdm
  > run 'pdm_cli nw test -f test.pdm'
  > This loads the pdm described in test.pdm and saves it as 'test'
  > run 'pdm_cli ls test' 
  > This prints the critical path as well as all the tasks.
  
Commands:
  > nw <pdm_name> <-f> <file_name>
    - Add a pdm with the specfied name
    - If the -f flag is present, load the pdm from a file with input like:
    	> <TaskID> <Duration> <Dependency_1>,<Dependency_2>,....<Dependency_x>
  > ad <pdm_name> <id> <duration> <dependencies>
    - Adds or updates a node in the pdm_name pdm
    - Node has an id from the given id
    - Duration is the length of the project
    - The dependencies are a comma separated list of node ids. 
    - Checks for circular dependencies, and adds a node with specified id, if one doesn't exist
  > ls <pdm_name>
    - Lists the pdm specified with pdm_name
    - If no pdm_name is provided, lists all pdms
  > rm <pdm_name> <-a|id>
    - Removes a node with given id or entire pdm from pdm_name
    - If -a is specified, entire pdm is removed
  > dpr <pdm_name>
    - Prints the critical path of the pdm_name
  > help
    - Prints a list of commands, flags, and arguments
