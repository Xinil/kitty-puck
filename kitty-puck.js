// setTime((new Date("Wed, 14 May 2020 09:33 PDT")).getTime()/1000)
var last_time_button_pressed = 0;
var button_pressed = false;
var how_often_to_check_ms = 30000; //in milliseconds
var time_to_wait_first = 86400;
var time_to_wait_second = time_to_wait_first + (time_to_wait_first / 2);
// var time_to_wait_third = time_to_wait_first * 2;
var off_start_hour = 0;
var off_end_hour = 7;
var current_time_unix;
var current_time_obj;
var led1_interval;
var led1_running = false;
var led3_interval;
var led3_running = false;
var on;


E.on('init', function() {
  last_time_button_pressed = getTime();
  turnAllOff();
});

var setPulse = function (myLED) {
  on = !on;
  myLED.write(on);
  console.log("pulse " + on);
};

setInterval(function() {
  current_time_unix = getTime();
  current_time_obj = new Date();
  var current_hour = current_time_obj.getHours();

  console.log("Current: " + current_hour + ", min " + current_time_obj.getMinutes() + ", sec " + + current_time_obj.getSeconds());
  console.log("led1_interval is " + led1_interval);
  if (current_hour >= off_start_hour && current_hour < off_end_hour) {
    turnAllOff();
  } else {
    determineLEDToUse();
  }
}, how_often_to_check_ms);

setWatch(function() {
  // console.log("last press: "+last_time_button_pressed);
  last_time_button_pressed = getTime();
  if (!button_pressed) {
    button_pressed = true;
  } else {
    button_pressed = false;
  }
  
  turnAllOff();
}, BTN, {edge:"rising", debounce:50, repeat:true});

function determineLEDToUse() {
  console.log("Determine");

  var first_interval_check = (current_time_unix > (last_time_button_pressed + time_to_wait_first));
  var second_interval_check = (current_time_unix > (last_time_button_pressed + time_to_wait_second));

  if (first_interval_check && !second_interval_check) {
    console.log("first on");
    if (!led3_running) {
      console.log("setup interval3");
      led3_interval = setInterval(() => setPulse(LED3), 1000);
      led3_running = true;
    } else {
      console.log("led3_interval is already set");
    }
  } else {
    killBluePulse();
    LED3.write(false);
    console.log("first && !second, blue off");
  }

  if (second_interval_check) {
    console.log("second on");
    LED3.write(false);
    if (!led1_running) {
      console.log("setup interval1");
      led1_interval = setInterval(() => setPulse(LED1), 1000);
      led1_running = true;
    } else {
      console.log("led1_interval is already set");
    }
  } else {
    console.log("!second, red off");
  }
}


function killRedPulse() {
  if (led1_interval) {
    console.log("Cleared red pulse");
    clearInterval(led1_interval);
  }

  led1_interval = false;
  led1_running = false;
}

function killBluePulse() {
  if (led3_interval) {
    console.log("Cleared blue pulse");
    clearInterval(led3_interval);
  }

  led3_interval = false;
  led3_running = false;
}

function turnAllOff() {
  killBluePulse();
  killRedPulse();

  console.log("All off");
  LED3.write(false);
  LED1.write(false);
  LED2.write(false);
}
