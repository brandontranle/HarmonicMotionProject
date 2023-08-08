(function () {
  alert(
    "Welcome to my Physics 1A project! Feel free to read around the website and play with the simulation :)"
  );

  // Timer variables
  var timerRunning = false;
  var startTime = 0;
  var elapsedTime = 0;
  var longestTime = 0;
  var mostRecentTime = 0;
  var animationFrameId;
  var recentlyReset = false;

  //Start timer
  function startTimer() {
    if (!timerRunning) {
      startTime = Date.now();
      timerRunning = true;
    }
  }

  //continue timer from where it was left off after a pause
  function resumeTimer() {
    if (!timerRunning) {
      startTime = Date.now() - elapsedTime;
      timerRunning = true;
    }
  }

  // Function to reset the timer to zero
  function resetTimer() {
    timerRunning = false;
    elapsedTime = 0;
    startTimer();
  }

  //Function used to stop the timer when the user presses the stop button
  function stopTimer() {
    timerRunning = false;
    //store current state of time into a temp variable known as, resumeTime
    elapsedTime = Date.now() - startTime;
  }

  // Calculate position and velocity of the box
  var physics = (function () {
    // Initial condition for the system
    var initialConditions = {
      position: 0.99, // Box is shown on the right initially
      velocity: 0.0, // Velocity is zero
      springConstant: 100.0, // The higher the value the stiffer the spring
      mass: 10.0, // The mass of the box
      amplitude: 30.0, // The amplitude of the oscillation
    };

    // Current state of the system
    var state = {
      /*
      Position of the box:
        0 is when the box is at the center.
        1.0 is the maximum position to the right.
        -1.0 is the maximum position to the left.
      */

      position: 0,
      velocity: 0,
      springConstant: 0, // The higher the value the stiffer the spring
      mass: 0, // The mass of the box
      amplitude: 0, // The amplitude of the oscillation
    };

    var deltaT = 0.003475; // The length of the time increment, in seconds.

    function resetStateToInitialConditions() {
      state.position = initialConditions.position;
      state.velocity = initialConditions.velocity;
      state.springConstant = initialConditions.springConstant;
      state.mass = initialConditions.mass;
      state.amplitude = initialConditions.amplitude;
    }

    // Returns acceleration (change of velocity) for the given position
    function calculateAcceleration(x) {
      // We are using the equation of motion for the harmonic oscillator:
      // a = -(k/m) * x
      // Where a is acceleration, x is displacement, k is spring constant and m is mass.

      return -(state.springConstant / state.mass) * x;
    }

    // Calculates the new velocity: current velocity plus the change.
    function newVelocity(acceleration) {
      return state.velocity + deltaT * acceleration;
    }

    // Calculates the new position: current position plus the change.
    function newPosition() {
      return state.position + deltaT * state.velocity;
    }

    // The main function that is called on every animation frame.
    // It calculates and updates the current position of the box.

    let prevPosition = 0;
    function updatePosition() {
      var acceleration = calculateAcceleration(state.position);
      // Update velocity and position via th equation of motion: x = x0 + v0 * t + 1/2 * a * t^2
      state.velocity = newVelocity(acceleration);
      state.position = newPosition();

      //resets to initial conditions if the box goes out of bounds
      if (state.position > 1) {
        state.position = 1;
      }
      if (state.position < -1) {
        state.position = -1;
      }

      if (
        (prevPosition < 0.99 && newPosition() >= 0.99) ||
        (prevPosition > -0.99 && newPosition() <= -0.99)
      ) {
        // Box is stationary at the center, reset the timer and record the most recent time
        mostRecentTime = (elapsedTime / 1000).toFixed(2);
        // Update the most recent time whenever the box reaches an extreme position
        resetTimer();
      }

      // Update the previous position for the next iteration
      prevPosition = newPosition();
    }

    return {
      resetStateToInitialConditions: resetStateToInitialConditions,
      updatePosition: updatePosition,
      initialConditions: initialConditions,
      state: state,
    };
  })();

  //GLOBAL SPRING VARIABLES THAT MANIPULATES HOW IT LOOKS
  springInfo = {
    height: 30, // Height of the spring
    numberOfSegments: 15, // Number of segments in the spring.
  };

  var graphics = (function () {
    var canvas = null, // Canvas DOM element.
      context = null, // Canvas context for drawing.
      canvasHeight = 300,
      boxSize = 50,
      colors = {
        shade30: "#be96f3",
        shade40: "#be96f3",
        shade50: "#be96f3",
      };

    // Return the middle X position of the box
    function boxMiddleX(position) {
      var boxSpaceWidth = canvas.width - boxSize;
      return (boxSpaceWidth * (position + 1)) / 2 + boxSize / 2;
    }

    // Draw curvy spring from the box to the center. Position argument is the box position and varies from -1 to 1.
    // Value 0 corresponds to the central position, while -1 and 1 are the left and right respectively.
    function drawSpring(position) {
      var springEndX = boxMiddleX(position),
        springTopY = (canvasHeight - springInfo.height) / 2,
        springEndY = canvasHeight / 2,
        canvasMiddleX = canvas.width / 2,
        numCurves = 6, // Adjust the number of curves to control the curviness
        curveHeight = 20, // Adjust the height of the curves to control the curviness
        singleSegmentWidth =
          (canvasMiddleX - springEndX) / (springInfo.numberOfSegments - 1),
        springGoesUp = true;

      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = colors.shade40;
      context.moveTo(springEndX, springEndY);

      for (var i = 0; i < springInfo.numberOfSegments; i++) {
        var currentSegmentWidth = singleSegmentWidth;
        if (i === 0 || i === springInfo.numberOfSegments - 1) {
          currentSegmentWidth /= 2;
        }

        springEndX += currentSegmentWidth;

        // Add curves to make it look like a curvy spring
        for (var j = 0; j < numCurves; j++) {
          var curveX =
            springEndX -
            currentSegmentWidth / 2 +
            (j / (numCurves - 1)) * currentSegmentWidth;
          var curveY =
            springTopY +
            (springEndY - springTopY) * (j / (numCurves - 1)) -
            (curveHeight / 2) * Math.sin((j * Math.PI) / (numCurves - 1));
          context.quadraticCurveTo(curveX, curveY, springEndX, springEndY);
        }

        springGoesUp = !springGoesUp;
      }

      context.stroke();
    }

    function drawCircle(position) {
      var circleRadius = boxSize / 2; // Radius of the circle
      var circleCenterX = boxMiddleX(position); // Center X position of the circle
      var circleCenterY = canvasHeight / 2; // Center Y position of the circle

      context.beginPath();
      context.fillStyle = colors.shade50;
      context.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI); // Draw a full circle
      context.fill();

      // Border around the circle (optional)
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = colors.shade30;
      context.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
      context.stroke();
    }

    // Draw vertical line in the middle
    function drawMiddleLine() {
      var middleX = Math.floor(canvas.width / 2);

      context.beginPath();
      context.moveTo(middleX, 0);
      context.lineTo(middleX, canvas.height);
      context.lineWidth = 2;
      context.strokeStyle = colors.shade40;
      context.setLineDash([2, 3]);
      context.stroke();
      context.setLineDash([1, 0]);
    }

    // Clears everything and draws the whole scene: the line, spring and the box.
    function drawScene(position) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawMiddleLine();
      drawSpring(position);
      drawCircle(position);
    }

    function hideCanvasNotSupportedMessage() {
      document.getElementById(
        "HarmonicOscillator-notSupportedMessage"
      ).style.display = "none";
    }

    // Resize canvas to will the width of container
    function fitToContainer() {
      canvas.style.width = "100%";
      canvas.style.height = canvasHeight + "px";
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    // Create canvas for drawing and call success argument
    function init(success) {
      // Find the canvas HTML element
      canvas = document.querySelector(".HarmonicOscillator-canvas");

      // Check if the browser supports canvas drawing
      if (!(window.requestAnimationFrame && canvas && canvas.getContext)) {
        return;
      }

      // Get canvas context for drawing
      context = canvas.getContext("2d");
      if (!context) {
        return;
      } // Error, browser does not support canvas

      // If we got to this point it means the browser can draw
      // Hide the old browser message
      hideCanvasNotSupportedMessage();

      // Update the size of the canvas
      fitToContainer();

      // Execute success callback function
      success();
    }

    return {
      fitToContainer: fitToContainer,
      drawScene: drawScene,
      init: init,
    };
  })();

  // Start the simulation
  var simulation = (function () {
    // The method is called 60 times per second
    function animate() {
      physics.updatePosition();
      graphics.drawScene(physics.state.position);
      var seconds = 0;

      //modify the label to show the time
      if (timerRunning) {
        elapsedTime = Date.now() - startTime;
        seconds = (elapsedTime / 1000).toFixed(2);

        document.getElementsByClassName(
          "HarmonicOsccilator-label HarmonicOsccilator-timer"
        )[0].innerHTML = "Time: " + seconds + "s";

        if (elapsedTime > longestTime) {
          longestTime = elapsedTime;
          var longestSeconds = (longestTime / 1000).toFixed(2);
          document.getElementsByClassName(
            "HarmonicOsccilator-label HarmonicOsccilator-longestRun"
          )[0].innerHTML = "Longest: " + longestSeconds + " s";
        }

        // Update the most recent time whenever the box reaches an extreme position
        document.getElementsByClassName(
          "HarmonicOsccilator-label HarmonicOsccilator-recentRun"
        )[0].innerHTML = "Recent: " + mostRecentTime + " s";
      }

      animationFrameId = window.requestAnimationFrame(animate);
    }

    function start() {
      graphics.init(function () {
        // Use the initial conditions for the simulation
        physics.resetStateToInitialConditions();
        startTimer();
        prevPosition = physics.state.position;

        // Redraw the scene if page is resized
        window.addEventListener("resize", function (event) {
          graphics.fitToContainer();
          graphics.drawScene(physics.state.position);
        });

        // Start the animation sequence
        animate();
      });
    }

    function resume() {
      graphics.init(function () {
        //continue the simulation with the current state
        resumeTimer();

        // Redraw the scene if page is resized
        window.addEventListener("resize", function (event) {
          graphics.fitToContainer();
          graphics.drawScene(physics.state.position);
        });

        // Start the animation sequence
        animate();
      });
    }

    return {
      start: start,
      resume: resume,
    };
  })();

  simulation.start();

  function startSimulation() {
    if (timerRunning) {
      return; // If running, do nothing and return from the function
    }

    recentlyReset = false;

    // Start the animation loop again
    simulation.resume();
  }

  //Function to reset the simulation
  function resetSimulation() {
    stopTimer();
    stopSimulation();
    recentlyReset = true;
    startTime = 0;
    elapsedTime = 0;
    mostRecentTime = 0;
    physics.resetStateToInitialConditions();
    var massInput = document.getElementById("HarmonicOscillator-mass");
    var springConstantInput = document.getElementById(
      "HarmonicOscillator-springConstant"
    );
    var amplitudeInput = document.getElementById(
      "HarmonicOscillator-amplitude"
    );
    massInput.value = physics.initialConditions.mass;
    springConstantInput.value = physics.initialConditions.springConstant;
    amplitudeInput.value = physics.initialConditions.amplitude;
    springInfo.height = physics.initialConditions.amplitude;
    longestTime = 0;
    document.getElementsByClassName(
      "HarmonicOsccilator-label HarmonicOsccilator-timer"
    )[0].innerHTML = "Time: 0.00s";
    document.getElementsByClassName(
      "HarmonicOsccilator-label HarmonicOsccilator-longestRun"
    )[0].innerHTML = "Longest: 0.00 s";

    document.getElementsByClassName(
      "HarmonicOsccilator-label HarmonicOsccilator-recentRun"
    )[0].innerHTML = "Recent: 0.00 s";

    graphics.drawScene(physics.state.position);
  }

  function stopSimulation() {
    if (!recentlyReset) {
      stopTimer();
      cancelAnimationFrame(animationFrameId);
    }
  }

  // Get input for the mass and the spring constant from the user
  var userInput = (function () {
    // Update mass and spring constant with selected values
    function updateSimulation(massInput, springConstantInput, amplitudeInput) {
      physics.resetStateToInitialConditions();
      physics.state.mass =
        parseFloat(massInput.value) || physics.initialConditions.mass;
      physics.state.springConstant =
        parseFloat(springConstantInput.value) ||
        physics.initialConditions.springConstant;
      springInfo.height = parseFloat(amplitudeInput.value) || 30;
    }

    function init() {
      // Mass
      // -----------

      var massInput = document.getElementById("HarmonicOscillator-mass");

      // Set initial mass value
      massInput.value = physics.initialConditions.mass;

      // User updates mass in simulation
      massInput.addEventListener("input", function () {
        updateSimulation(massInput, springConstantInput, amplitudeInput);
      });

      // Spring constant
      // -----------

      var springConstantInput = document.getElementById(
        "HarmonicOscillator-springConstant"
      );

      // Set initial spring constant value
      springConstantInput.value = physics.initialConditions.springConstant;

      // User updates spring constant in simulation
      springConstantInput.addEventListener("input", function () {
        updateSimulation(massInput, springConstantInput, amplitudeInput);
      });

      // Amplitude
      // -----------
      var amplitudeInput = document.getElementById(
        "HarmonicOscillator-amplitude"
      );
      amplitudeInput.value = physics.initialConditions.amplitude;
      amplitudeInput.addEventListener("input", function () {
        updateSimulation(massInput, springConstantInput, amplitudeInput);
      });

      // Reset button
      // -----------
      var resetButton = document.getElementById(
        "HarmonicOscillator-resetButton"
      );
      resetButton.addEventListener("click", function () {
        resetSimulation();
      });
    }

    //Stop button
    var stopButton = document.getElementById("HarmonicOscillator-stopButton");
    stopButton.addEventListener("click", function () {
      stopSimulation();
    });

    //Start button
    var startButton = document.getElementById("HarmonicOscillator-startButton");
    startButton.addEventListener("click", function () {
      startSimulation();
    });

    /*
    //Modify deltaT for Chrome
    var chromePreference = document.getElementById("ChomeOptimization");
    chromePreference.addEventListener('click', function() {
      physics.deltaT = 0.0016;
    });*/

    return {
      init: init,
    };
  })();

  userInput.init();
})();
