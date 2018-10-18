// Controller state logic
let mainMenu = document.getElementById('main-menu');
let joinRoom = document.getElementById('join-room');
let inGame = document.getElementById('in-game');
var client = null;
var playerName = "";
var roomId = "";

var gestureListenerIntervals = {};
var gestureCacheStore = {};
var sensor = null;


var processShake = setInterval(() => {
    let accVal = gestureCacheStore['shake'];
    let squaredLength = accVal.x * accVal.x + accVal.y * accVal.y + accVal.z * accVal.z;
    console.log("shake saving", accVal, squaredLength);
    if (squaredLength >= 25) {
        console.log("past threshold, sending values");
        this.client.player.send(JSON.stringify({
            type: "shake",
            user: playerName,
            payload: "shakeSent"
        }));
    }
    // Unity source for reference
    //if (Input.acceleration.sqrMagnitude >= _sqrShakeDetectionThreshold
    //    && Time.unscaledTime >= _timeSinceLastShake + _minShakeInterval)
    //{
    //    _rb2d.AddForce(new Vector2(0, 1000));
    //    _timeSinceLastShake = Time.unscaledTime;
    //    _animator.SetTrigger("Flap");
    //}
}, 200);

// client gesture handlers
var startShakeDetect = () => {
    // assign this so we dont lost context in helper functions
    if ('LinearAccelerationSensor' in window) {

        sensor = new LinearAccelerationSensor();
        sensor.addEventListener('reading', e => {
            gestureCacheStore['shake'] = sensor;
        });
        sensor.start();


    } else if ('DeviceMotionEvent' in window) {

        window.addEventListener('devicemotion', eventHandler => {
            gestureCacheStore['shake'] = eventHandler.acceleration;
        }, false);
    }

    gestureListenerIntervals['shake'] = processShake;
}

var stopShakeDetect = () => {
    if (sensor != null) {
        sensor.stop();
        sensor = null;
    }

    clearInterval(gestureListenerIntervals['shake']);
    delete gestureListenerIntervals['shake'];
}




// currently hard coded flow
function mainMenuPlayClicked() {
    mainMenu.style.display = "none";
    joinRoom.style.display = "block";
}
document.getElementById('main-menu-play').onclick = mainMenuPlayClicked;



function joinRoomPlayClicked() {
    joinRoom.style.display = "none";
    inGame.style.display = "block";

    playerName = document.getElementById('usercode-input').value;
    roomId = document.getElementById('roomcode-input').value;

    client = new SumoClient(playerName, roomId);
    client.start();

    startShakeDetect();

}
document.getElementById('join-room-join').onclick = joinRoomPlayClicked;


