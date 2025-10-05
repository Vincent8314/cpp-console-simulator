// DOM elements
const consoleDiv = document.getElementById("console");
const userInput = document.getElementById("userInput");
const cppCodeArea = document.getElementById("cppCode");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const statusSpan = document.getElementById("status");

// State
let messages = [];
let isRunning = false;

// Update status
function setStatus(text, type = 'idle') {
  statusSpan.textContent = `Status: ${text}`;
  statusSpan.className = `status ${type}`;
}

// Append text to console
function appendConsole(text) {
  consoleDiv.textContent += text;
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// Clear console
function clearConsole() {
  consoleDiv.textContent = "";
}

// Send message to OpenAI API
async function sendMessage(content) {
  messages.push({ role: "user", content });
  
  try {
    userInput.disabled = true;
    setStatus("Processing...", "running");
    
const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      appendConsole(`\nAPI Error: ${data.error.message}\n`);
      setStatus("API Error", "error");
      userInput.disabled = true;
      isRunning = false;
      return;
    }
    
    const reply = data.choices[0].message.content;
    messages.push({ role: "assistant", content: reply });
    
    appendConsole(reply);
    
    // Enable input for next interaction
    userInput.disabled = false;
    userInput.focus();
    setStatus("Running (waiting for input)", "waiting");
    
  } catch (err) {
    appendConsole(`\nError: ${err.message}\n`);
    setStatus("Error", "error");
    userInput.disabled = true;
    isRunning = false;
  }
}

// Run button handler
runBtn.addEventListener("click", async () => {
  const code = cppCodeArea.value.trim();
  
  if (!code) {
    alert("Please enter C++ code first.");
    return;
  }
  
  // Reset state
  messages = [
    { 
      role: "system", 
      content: `You are a C++ compiler and console. Execute the code and show only console output - no explanations.
When you need input, stop and wait for it.`
    }
  ];
  
  clearConsole();
  isRunning = true;
  userInput.disabled = true;
  runBtn.disabled = true;
  
  // Simulate compilation delay
  setStatus("Compiling...", "running");
  appendConsole("Compiling...\n");
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  appendConsole("\n");
  setStatus("Running...", "running");
  
  // Send code for execution
  await sendMessage(`Execute this C++ program:\n\n${code}`);
});

// Reset button handler - NUCLEAR RESET
resetBtn.addEventListener("click", () => {
  // Complete destruction of conversation state - multiple methods to ensure complete reset
  messages = [];
  messages.length = 0;
  messages = new Array();
  
  // Clear all visual elements thoroughly
  clearConsole();
  consoleDiv.textContent = "";
  consoleDiv.innerHTML = "";
  
  // Reset all state variables
  isRunning = false;
  
  // Reset input field completely
  userInput.disabled = true;
  userInput.value = "";
  userInput.blur();
  
  // Re-enable run button
  runBtn.disabled = false;
  
  // Reset status display
  setStatus("Idle", "idle");
  statusSpan.textContent = "Status: Idle";
  statusSpan.className = "status idle";
  
  // Attempt garbage collection if available (non-standard but safe)
  if (window.gc) {
    window.gc();
  }
});

// Input handler
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const value = userInput.value;
    
    // Show user input in console
    appendConsole(value + "\n");
    
    userInput.value = "";
    
    // Send input to continue execution
    sendMessage(value);
  }
});

// Initial state
setStatus("Idle", "idle");

