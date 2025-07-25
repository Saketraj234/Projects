let memory = 0;
let display = document.getElementById("display");

// Theme settings
const themes = {
  dark: {
    "--bg-color": "#1a1a1a",
    "--text-color": "#ffffff",
    "--button-bg": "#333333",
    "--button-hover": "#444444",
    "--operator-bg": "#ff9500",
    "--operator-hover": "#ffaa33",
  },
  light: {
    "--bg-color": "#f0f0f0",
    "--text-color": "#333333",
    "--button-bg": "#ffffff",
    "--button-hover": "#eeeeee",
    "--operator-bg": "#ff9500",
    "--operator-hover": "#ffaa33",
  },
  blue: {
    "--bg-color": "#1a2b3c",
    "--text-color": "#ffffff",
    "--button-bg": "#2c3e50",
    "--button-hover": "#34495e",
    "--operator-bg": "#3498db",
    "--operator-hover": "#2980b9",
  },
};

function setTheme(theme) {
  const root = document.documentElement;
  const themeColors = themes[theme];
  Object.entries(themeColors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

function appendToDisplay(value) {
  if (display.value === "Error") display.value = "";
  if (value === "π") value = Math.PI;
  if (value === "e") value = Math.E;
  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function clearMemory() {
  memory = 0;
}

function recallMemory() {
  display.value = memory;
}

function addToMemory() {
  try {
    memory += eval(display.value);
  } catch (error) {
    display.value = "Error";
  }
}

function subtractFromMemory() {
  try {
    memory -= eval(display.value);
  } catch (error) {
    display.value = "Error";
  }
}

function calculate() {
  try {
    let expression = display.value
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/\^/g, "**");
    display.value = eval(expression);
  } catch (error) {
    display.value = "Error";
  }
}

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (
    (key >= "0" && key <= "9") ||
    key === "." ||
    key === "+" ||
    key === "-" ||
    key === "*" ||
    key === "/" ||
    key === "(" ||
    key === ")" ||
    key === "^"
  ) {
    appendToDisplay(key);
  } else if (key === "Enter") {
    calculate();
  } else if (key === "Backspace") {
    display.value = display.value.slice(0, -1);
  } else if (key === "Escape") {
    clearDisplay();
  }
});

// Set initial theme
setTheme("dark");
