// background.js

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Act only if the page is fully loaded and is an HTTP/HTTPS page.
    if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
      // Inject CSS for our notch.
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["injected.css"]
      }).catch(err => console.error("CSS insertion error:", err));
  
      // Inject our notch-creating function into the page.
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectNotch,
        world: "MAIN" // Run in the main world so the fullscreen request is a direct user gesture.
      }).catch(err => console.error("Script injection error:", err));
    }
  });
  
  // This function is injected into the active page.
  function injectNotch() {
    // Avoid duplicate injection.
    if (document.getElementById("fullscreen-notch")) return;
  
    // Create the notch container.
    var notch = document.createElement("div");
    notch.id = "fullscreen-notch";
  
    // Create a child element (span) that will hold the icon.
    var iconSpan = document.createElement("span");
    notch.appendChild(iconSpan);
  
    // Append the notch to the page.
    document.body.appendChild(notch);
  
    // Update the notch based on the fullscreen state.
    function updateNotch() {
      if (document.fullscreenElement) {
        // When in fullscreen, show the "exit" icon (✕) and add a class.
        iconSpan.textContent = "✕";
        notch.classList.add("fullscreen");
      } else {
        // When not in fullscreen, show the "enter" icon (⛶) and remove the class.
        iconSpan.textContent = "⛶";
        notch.classList.remove("fullscreen");
      }
    }
  
    // When the notch is clicked, toggle fullscreen.
    notch.addEventListener("click", function() {
      if (!document.fullscreenElement) {
        // Request entering fullscreen.
        document.documentElement.requestFullscreen().then(updateNotch)
          .catch(err => console.error("Error entering fullscreen:", err));
      } else {
        // Request exiting fullscreen.
        document.exitFullscreen().then(updateNotch)
          .catch(err => console.error("Error exiting fullscreen:", err));
      }
    });
  
    // Listen for any fullscreen changes (e.g. if the user presses ESC).
    document.addEventListener("fullscreenchange", updateNotch);
  
    // Set the initial state.
    updateNotch();
  }
  