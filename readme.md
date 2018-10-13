This repo contains two separate applications:
 1) A JS layer to interface with a Unity3d compiled WebGL application
 2) A JS application to serve as a controller-client


# Unity-webRTC Interface
Unity3d does not provide WebRTC APIs natively, so we are using JS to create a WebRTC connection, and then pass messages to the Unity application 

The structure of this repo lies mainly in the `WebRTCTemplate` folder. This folder is what you should import directly into your Unity project's assets, under a folder named `WebGLTemplates`.

When building your WebGL project, you can now see this folder as a template option.
Selecting this means that Unity will create the final html/js folder using this template. 

# Controller-client
This application serves as a client to send messages to the unity application. 

It involves some basic user flows, such as entering a roomID

This application lies in the `ControllerClient` folder. 



# References
- [Networking in Unity WebGL](https://docs.unity3d.com/Manual/webgl-networking.html)
- [Browser scripting with Unity WebGL](https://docs.unity3d.com/Manual/webgl-interactingwithbrowserscripting.html)
- [WebGL templates](https://docs.unity3d.com/Manual/webgl-templates.html)
