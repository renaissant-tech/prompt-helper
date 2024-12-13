# Prompt Helper

**Prompt Helper** is a Brave browser extension that provides a convenient sidebar for interacting with text fields on any webpage. It helps you:

- **Prompt Tab:** Write text, inject it into text fields on the page, and streamline your coding workflow.
- **Receive Tab:** Paste code snippets from your clipboard and run them against a locally accessible directory (via native messaging).  
- **Tree Tab:** Open a local folder in read-only mode to view and select files.  
- **Run Output Tab:** Intended for showing output from your locally run scripts (future feature).

The goal is to integrate with local tools to speed up coding and script management tasks.

## Features
- Quickly inject text from the Prompt tab into focused fields on any webpage.
- Easily paste code from clipboard in the Receive tab, then run a local script.
- Browse and select files from a chosen local directory on the Tree tab.
- Toggle the sidebar on and off by clicking the extension’s icon.

*Note: Running local scripts and writing to files requires setting up a native messaging host, which is not included by default.*

## Setup Instructions

### Prerequisites
- A Brave browser (Chromium-based browsers are compatible).
- Developer mode enabled in Brave Extensions.

### Steps
1. **Get the Extension Files:**
   - Place all provided extension files (`manifest.json`, `content.js`, `content.css`, `background.js`, `logo.png`) into a directory on your machine.  
   For example: `~/prompt-helper-extension/`

2. **Enable Developer Mode in Brave:**
   - Open Brave and go to `brave://extensions/`.
   - Toggle **Developer mode** on in the top-right corner.

3. **Load the Unpacked Extension:**
   - Click on **"Load unpacked"**.
   - Select the `prompt-helper-extension` directory.
   - The **Prompt Helper** icon should now appear in your toolbar.

4. **Using the Extension:**
   - Click the extension’s icon in the toolbar to toggle the sidebar.
   - In the **Prompt** tab (upper section), type any text and click "Inject" to insert it into the currently focused webpage field.
   - In the **Receive** tab, paste clipboard code and click "Run" to (conceptually) write and execute `script.sh` in your chosen directory. (Requires native messaging setup.)
   - In the **Tree** tab (lower section), click "Open Folder" to select a folder (via `webkitdirectory`). Browse and select files, then add their contents to your prompt text.
   - The **Run Output** tab (lower section) is reserved for displaying script execution results once native messaging is configured.

### Native Messaging Setup (Optional)
To fully leverage the "Run" functionality:
- Create a native messaging host on your Mac.
- Install a host manifest specifying the path and permissions for the native host.
- Implement logic in the native host to write `script.sh` and run it upon receiving messages from the extension.

This process is more involved and beyond the scope of this basic README, but follow [Google’s Native Messaging documentation](https://developer.chrome.com/docs/apps/nativeMessaging/) for guidance.

### Troubleshooting
- If the sidebar doesn’t appear, ensure you’re on a regular webpage (not an internal `brave://` page).
- If injection doesn’t work, make sure a text input or textarea is focused on the page.
- Ensure that Developer Mode is enabled and the extension is reloaded if any changes are made to its files.

---

**Prompt Helper** is meant as a utility for personal use, integrating browser-based text manipulation with local scripting to streamline your coding workflow.

