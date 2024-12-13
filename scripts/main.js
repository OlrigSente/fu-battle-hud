// at start of foundry
console.log("Hello World! This code runs immediately when the file is loaded.");

// on main screen
Hooks.on("init", function() {
  console.log("This code runs once the Foundry VTT software begins its initialization workflow.");
});

// when world is loaded
Hooks.on("ready", function() {
  console.log("This code runs once core initialization is ready and game data is available.");
});