# THIS REPO IS IN DISARRAY

### The proof of concept for this project can be found at fomosumo.com

However, the code for this project lies in two detached branches, `client` and `host`.

A refactor is in the works but it is slow because there doesn't seem to really be a demand (?) for this (most use cases can get by with a socket server)

Refactoring is currently WIP in the `refactorWIP` branch. If you're interested to contribute to this project and help make the package a reality, feel free to contact us!


# END NOTICE


This repo contains two separate applications:
 1) A JS layer to interface with a Unity3d compiled WebGL application
 2) A JS application to serve as a controller-client


# Unity-webRTC Interface
Unity3d does not provide WebRTC APIs natively, so we are using JS to create a WebRTC connection, and then pass messages to the Unity application 

The structure of this repo lies mainly in the `WebRTCTemplate` folder. This folder is what you should import directly into your Unity project's assets, under a folder named `WebGLTemplates`. *Unity is finicky about JS. Include only `index.html` to avoid complications*. Add in removed files **AFTER** building

When building your WebGL project, you can now see this folder as a template option.
Selecting this means that Unity will create the final html/js folder using this template. 

## Interface
This section details the various ways messages are passed both ways

### From JS to unity
This is done by using `gameInstance.SendMessage` method. `SendMessage` takes 3 arguments:

e.g `gameInstance.SendMessage('UIManager', 'addPlayer', 'player1name')`

- The first argument is the component name that is receiving the information
- The second argument is the method to call on the component
- The last argument is additional information passed to the function (via arguments). This can only be strings and ints because yay Unity

#### JS->Unity interfaces

#####UIManager

- `AddPlayer(playerName)`: creates a player with playerName. Ignores if the game is full. Creates a new player with "z" appended if the player name already exists
- `RemovePlayer(playerName)`: removes a player with the name if it is in the game

##### GameController

- shake actions 
  -  `ShakePlayer1()`, `ShakePlayer2()`, `ShakePlayer3()`, `ShakePlayer4()`
  - sends a shake action for that specific player
  
### From Unity to JS
It is hard to do this because Unity requires JS functions to be added as a `.jslib` plugin in the assets folder.
Calling these functions then requires a weird DLL injection call thing (refer to Browser scripting in references)

#### Unity->JS interfaces
For now, we do not pass any messages directly since our interfaces are ill defined. For convenience, there
are two events that are sent on `window` to indicate if some actions are successful/unsuccessful

- `BrowserSuccess()`: fires a "success" event on `window`
- `BrowserFailure()`: fires a "failure" event on `window` 

# Controller-client
This application serves as a client to send messages to the unity application. 

It involves some basic user flows, such as entering a roomID

This application lies in the `ControllerClient` folder. 

## Firebase Hosting
Host: https://fomosumos-unity.firebaseapp.com/host/

Client: https://fomosumos-unity.firebaseapp.com/client/


# References
- [Networking in Unity WebGL](https://docs.unity3d.com/Manual/webgl-networking.html)
- [Browser scripting with Unity WebGL](https://docs.unity3d.com/Manual/webgl-interactingwithbrowserscripting.html)
- [WebGL templates](https://docs.unity3d.com/Manual/webgl-templates.html)


