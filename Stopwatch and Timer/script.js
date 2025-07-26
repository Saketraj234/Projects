// Global variables
let stopwatchInterval;
let timerInterval;
let stopwatchSeconds = 0;
let timerSeconds = 0;
let isStopwatchRunning = false;
let isTimerRunning = false;
let isDarkMode = false;

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  // Stopwatch elements
  const stopwatchDisplay = document.getElementById("stopwatch-display");
  const stopwatchStartBtn = document.getElementById("stopwatch-start");
  const stopwatchStopBtn = document.getElementById("stopwatch-stop");
  const stopwatchResetBtn = document.getElementById("stopwatch-reset");
  const stopwatchLapBtn = document.getElementById("stopwatch-lap");
  const lapsList = document.getElementById("laps-list");

  // Timer elements
  const timerDisplay = document.getElementById("timer-display");
  const timerHoursInput = document.getElementById("timer-hours");
  const timerMinutesInput = document.getElementById("timer-minutes");
  const timerSecondsInput = document.getElementById("timer-seconds");
  const timerStartBtn = document.getElementById("timer-start");
  const timerStopBtn = document.getElementById("timer-stop");
  const timerResetBtn = document.getElementById("timer-reset");

  // Date and time elements
  const currentTimeElement = document.getElementById("current-time");
  const currentDateElement = document.getElementById("current-date");

  // Theme toggle
  const themeToggleBtn = document.getElementById("theme-toggle");

  // Update current time and date
  function updateDateTime() {
    const now = new Date();

    // Update time
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;

    // Update date
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currentDateElement.textContent = now.toLocaleDateString("en-US", options);
  }

  // Update time and date every second
  setInterval(updateDateTime, 1000);
  updateDateTime(); // Initial update

  // Format time for display (HH:MM:SS format)
  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Stopwatch functions
  function startStopwatch() {
    if (!isStopwatchRunning) {
      // Add starting animation
      stopwatchDisplay.classList.add("starting");
      setTimeout(() => {
        stopwatchDisplay.classList.remove("starting");
      }, 500);

      isStopwatchRunning = true;
      stopwatchInterval = setInterval(() => {
        stopwatchSeconds++;
        stopwatchDisplay.textContent = formatTime(stopwatchSeconds);
        stopwatchDisplay.classList.add("running");
      }, 1000);

      // Animate control buttons
      stopwatchStartBtn.classList.add("active-btn");
      stopwatchStopBtn.classList.remove("active-btn");
    }
  }

  function stopStopwatch() {
    if (isStopwatchRunning) {
      // Add stopping animation
      stopwatchDisplay.classList.add("stopping");
      setTimeout(() => {
        stopwatchDisplay.classList.remove("stopping");
      }, 500);

      clearInterval(stopwatchInterval);
      isStopwatchRunning = false;
      stopwatchDisplay.classList.remove("running");

      // Animate control buttons
      stopwatchStopBtn.classList.add("active-btn");
      stopwatchStartBtn.classList.remove("active-btn");
    }
  }

  function resetStopwatch() {
    stopStopwatch();

    // Add reset animation
    stopwatchDisplay.classList.add("resetting");
    setTimeout(() => {
      stopwatchDisplay.classList.remove("resetting");
    }, 500);

    stopwatchSeconds = 0;
    stopwatchDisplay.textContent = formatTime(stopwatchSeconds);

    // Clear laps with animation
    const lapItems = lapsList.querySelectorAll("li");
    lapItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.05}s`;
      item.classList.add("removing");
    });

    setTimeout(
      () => {
        lapsList.innerHTML = "";
      },
      lapItems.length > 0 ? 500 : 0
    );

    // Reset button animations
    stopwatchStartBtn.classList.remove("active-btn");
    stopwatchStopBtn.classList.remove("active-btn");
  }

  function addLap() {
    if (isStopwatchRunning) {
      const lapItem = document.createElement("li");
      lapItem.textContent = formatTime(stopwatchSeconds);
      lapsList.appendChild(lapItem);

      // Add animation class
      lapItem.classList.add("new-lap");

      // Add staggered animation effect for lap items
      const lapCount = lapsList.children.length;
      lapItem.style.animationDelay = `${lapCount * 0.1}s`;

      setTimeout(() => {
        lapItem.classList.remove("new-lap");
      }, 500);

      // Scroll to the bottom of the laps list
      lapsList.scrollTop = lapsList.scrollHeight;
    }
  }

  // Timer functions
  function startTimer() {
    if (!isTimerRunning) {
      // Get input values
      const hours = parseInt(timerHoursInput.value) || 0;
      const minutes = parseInt(timerMinutesInput.value) || 0;
      const seconds = parseInt(timerSecondsInput.value) || 0;

      // Calculate total seconds
      timerSeconds = hours * 3600 + minutes * 60 + seconds;

      if (timerSeconds > 0) {
        // Add starting animation
        timerDisplay.classList.add("starting");
        setTimeout(() => {
          timerDisplay.classList.remove("starting");
        }, 500);

        isTimerRunning = true;
        timerInterval = setInterval(() => {
          if (timerSeconds > 0) {
            timerSeconds--;
            timerDisplay.textContent = formatTime(timerSeconds);
            timerDisplay.classList.add("running");

            
            if (
              timerSeconds <= 10 &&
              !timerDisplay.classList.contains("urgent")
            ) {
              timerDisplay.classList.add("urgent");
            }
          } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerDisplay.classList.remove("running");
            timerDisplay.classList.add("timer-ended");

            // Add pulse effect to the timer display
            timerDisplay.classList.add("timer-complete-pulse");

            // Play notification sound
            const audio = new Audio(
              "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
            );
            audio.play();

            setTimeout(() => {
              timerDisplay.classList.remove("timer-ended");
              timerDisplay.classList.remove("timer-complete-pulse");
            }, 3000);
          }
        }, 1000);

        // Animate control buttons
        timerStartBtn.classList.add("active-btn");
        timerStopBtn.classList.remove("active-btn");

        // Disable inputs with animation
        timerHoursInput.disabled = true;
        timerMinutesInput.disabled = true;
        timerSecondsInput.disabled = true;
        [timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(
          (input) => {
            input.classList.add("disabled-input");
          }
        );
      } else {

        // Shake animation for empty inputs
        [timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(
          (input) => {
            input.classList.add("shake");
            setTimeout(() => {
              input.classList.remove("shake");
            }, 500);
          }
        );
      }
    }
  }

  function stopTimer() {
    if (isTimerRunning) {
      // Add stopping animation
      timerDisplay.classList.add("stopping");
      setTimeout(() => {
        timerDisplay.classList.remove("stopping");
      }, 500);

      clearInterval(timerInterval);
      isTimerRunning = false;
      timerDisplay.classList.remove("running");
      timerDisplay.classList.remove("urgent");

      // Animate control buttons
      timerStopBtn.classList.add("active-btn");
      timerStartBtn.classList.remove("active-btn");
    }
  }

  function resetTimer() {
    stopTimer();

    // Add reset animation
    timerDisplay.classList.add("resetting");
    setTimeout(() => {
      timerDisplay.classList.remove("resetting");
    }, 500);

    timerSeconds = 0;
    timerDisplay.textContent = formatTime(timerSeconds);
    timerDisplay.classList.remove("timer-ended");
    timerDisplay.classList.remove("urgent");

    // Enable inputs with animation
    timerHoursInput.disabled = false;
    timerMinutesInput.disabled = false;
    timerSecondsInput.disabled = false;

    [timerHoursInput, timerMinutesInput, timerSecondsInput].forEach((input) => {
      input.classList.remove("disabled-input");
      input.classList.add("enabled-input");
      setTimeout(() => {
        input.classList.remove("enabled-input");
      }, 500);
    });

    timerHoursInput.value = "";
    timerMinutesInput.value = "";
    timerSecondsInput.value = "";

    // Reset button animations
    timerStartBtn.classList.remove("active-btn");
    timerStopBtn.classList.remove("active-btn");
  }

  // Theme toggle function
  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    isDarkMode = !isDarkMode;

    // Update button text
    themeToggleBtn.textContent = isDarkMode ? "Light Mode" : "Dark Mode";

    // Add animation
    document.body.classList.add("theme-transition");

    // Add animation to all control buttons
    const buttons = document.querySelectorAll(".control-btn, button");
    buttons.forEach((button, index) => {
      button.style.transition = "all 0.5s ease";
      button.style.transitionDelay = `${index * 0.05}s`;
      button.classList.add("animated");

      setTimeout(() => {
        button.style.transition = "";
        button.style.transitionDelay = "";
        button.classList.remove("animated");
      }, 800);
    });

    // Add animation to display containers
    const displays = document.querySelectorAll(
      "#stopwatch-display, #timer-display, #current-time, #current-date"
    );
    displays.forEach((display) => {
      display.classList.add("theme-change");
      setTimeout(() => {
        display.classList.remove("theme-change");
      }, 800);
    });

    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 500);
  }

  // Event listeners for stopwatch
  stopwatchStartBtn.addEventListener("click", startStopwatch);
  stopwatchStopBtn.addEventListener("click", stopStopwatch);
  stopwatchResetBtn.addEventListener("click", resetStopwatch);
  stopwatchLapBtn.addEventListener("click", addLap);

  // Event listeners for timer
  timerStartBtn.addEventListener("click", startTimer);
  timerStopBtn.addEventListener("click", stopTimer);
  timerResetBtn.addEventListener("click", resetTimer);

  // Event listener for theme toggle
  themeToggleBtn.addEventListener("click", toggleTheme);
});

      // Tab switching functionality
      document.addEventListener('DOMContentLoaded', () => {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
          });
        });
      });
