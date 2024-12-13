chrome.action.onClicked.addListener((tab) => {
  // Send a message to the content script in the active tab to toggle visibility
  chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
});

