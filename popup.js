// popup.js

document.getElementById("inject").addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].id) {
        // Insert the CSS (injected.css) into the active tab.
        chrome.scripting.insertCSS({
          target: { tabId: tabs[0].id },
          files: ["injected.css"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("CSS injection failed: ", chrome.runtime.lastError);
          }
        });
        
        // Inject the notch creation function into the active tab.
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: injectNotch,
          world: "MAIN" // Inject into the page’s main world to ensure a true user gesture
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed: ", chrome.runtime.lastError);
          }
          // Close the popup once injection is complete.
          window.close();
        });
      }
    });
  });
  
  // This function will be injected directly into the page.
  function injectNotch() {
    // Prevent duplicate injection.
    if (document.getElementById("fullscreen-notch")) return;
  
    // Create the notch container.
    var notch = document.createElement("div");
    notch.id = "fullscreen-notch";
  
    // Create a child span to hold the icon.
    var iconSpan = document.createElement("span");
    notch.appendChild(iconSpan);
  
    // Append the notch to the page body.
    document.body.appendChild(notch);
  
    // Function to update the notch appearance based on fullscreen state.
    function updateNotch() {
      if (document.fullscreenElement) {
        // In fullscreen: show an exit icon and apply fullscreen styling.
        iconSpan.textContent = "✕";
        notch.classList.add("fullscreen");
      } else {
        // In windowed mode: show the enter fullscreen icon.
        iconSpan.textContent = "⛶";
        notch.classList.remove("fullscreen");
      }
    }
  
    // Attach click listener to toggle fullscreen.
    notch.addEventListener("click", function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(updateNotch)
          .catch(err => console.error("Error entering fullscreen:", err));
      } else {
        document.exitFullscreen().then(updateNotch)
          .catch(err => console.error("Error exiting fullscreen:", err));
      }
    });
  
    // Listen for changes (e.g., if the user hits ESC).
    document.addEventListener("fullscreenchange", updateNotch);
  
    // Initialize the notch’s appearance.
    updateNotch();
  }
  