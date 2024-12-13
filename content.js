(function() {
  if (document.getElementById('textInjectorSidebar')) return;

  let lastFocusedField = null;
  const IGNORED_DIRS = new Set(['.git', 'node_modules', 'server', '.next']);
  let openedDirectoryName = null; // We'll store a reference to the chosen folder's top-level directory name
  let fileList = [];

  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'textInjectorSidebar';
  sidebar.classList.add('hidden'); // start hidden
  sidebar.innerHTML = `
    <div id="textInjectorHeader">
      <h3>Text Injector</h3>
    </div>
    <div id="upperSection">
      <div class="tabs" id="upperTabs">
        <button data-tab="promptTab" class="active">Prompt</button>
        <button data-tab="receiveTab">Receive</button>
      </div>
      <div class="tab-content active" id="promptTab">
        <textarea id="injectTextArea" placeholder="Type your text here..."></textarea>
        <button id="injectBtn">Inject</button>
      </div>
      <div class="tab-content" id="receiveTab">
        <button id="pasteBtn">Paste</button>
        <textarea id="receiveTextArea" placeholder="Pasted code..."></textarea>
        <button id="runBtn">Run</button>
      </div>
    </div>
    <div id="lowerSection">
      <div class="tabs" id="lowerTabs">
        <button data-tab="treeTab" class="active">Tree</button>
        <button data-tab="runOutputTab">Run Output</button>
      </div>
      <div class="tab-content active" id="treeTab">
        <div id="folderSelection">
          <button id="selectFolderBtn">Open Folder</button>
          <button id="addFilesBtn">Add Selected Files</button>
          <input type="file" id="folderInput" webkitdirectory multiple />
        </div>
        <div id="fileTree"></div>
      </div>
      <div class="tab-content" id="runOutputTab">
        <!-- Run output will appear here in the future -->
        <p>Run output will appear here...</p>
      </div>
    </div>
    <div id="textInjectorResizeHandle"></div>
  `;
  document.body.appendChild(sidebar);

  const injectBtn = sidebar.querySelector('#injectBtn');
  const textArea = sidebar.querySelector('#injectTextArea');
  const resizeHandle = sidebar.querySelector('#textInjectorResizeHandle');

  const selectFolderBtn = sidebar.querySelector('#selectFolderBtn');
  const addFilesBtn = sidebar.querySelector('#addFilesBtn');
  const folderInput = sidebar.querySelector('#folderInput');
  const fileTreeContainer = sidebar.querySelector('#fileTree');

  const pasteBtn = sidebar.querySelector('#pasteBtn');
  const receiveTextArea = sidebar.querySelector('#receiveTextArea');
  const runBtn = sidebar.querySelector('#runBtn');

  // Tab logic for upper and lower sections
  function setupTabs(tabsContainerId) {
    const tabsContainer = sidebar.querySelector(`#${tabsContainerId}`);
    const tabButtons = tabsContainer.querySelectorAll('button');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tabName = btn.getAttribute('data-tab');
        const parentSection = tabsContainer.parentNode;
        const tabContents = parentSection.querySelectorAll('.tab-content');
        tabContents.forEach(tc => {
          tc.classList.remove('active');
          if (tc.id === tabName) {
            tc.classList.add('active');
          }
        });
      });
    });
  }

  setupTabs('upperTabs');
  setupTabs('lowerTabs');

  // Listen for toggle messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSidebar") {
      sidebar.classList.toggle('hidden');
      sendResponse({result: "toggled"});
    }
  });

  // Focus tracking
  document.addEventListener('focusin', (e) => {
    const elem = e.target;
    if (sidebar.contains(elem)) {
      return;
    }
    if (
      elem &&
      (
        (elem.tagName === 'INPUT' && !['button','submit','checkbox','radio'].includes(elem.type)) ||
        elem.tagName === 'TEXTAREA' ||
        elem.contentEditable === 'true'
      )
    ) {
      lastFocusedField = elem;
    }
  }, true);

  // Inject functionality (Prompt tab)
  injectBtn.addEventListener('click', () => {
    const text = textArea.value;
    if (!text) {
      alert('Please enter some text to inject.');
      return;
    }

    let targetField = null;
    if (lastFocusedField && document.contains(lastFocusedField)) {
      targetField = lastFocusedField;
    } else {
      targetField = document.querySelector('input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable="true"]');
    }

    if (targetField) {
      if (targetField.tagName === 'INPUT' || targetField.tagName === 'TEXTAREA') {
        targetField.value = text;
      } else if (targetField.contentEditable === 'true') {
        targetField.innerText = text;
      }

      setTimeout(() => {
        targetField.focus();
        if (targetField.selectionStart !== undefined && targetField.value !== undefined) {
          const len = targetField.value.length;
          targetField.selectionStart = len;
          targetField.selectionEnd = len;
        }
      }, 50);
    } else {
      alert('No suitable text field found to inject into.');
    }
  });

  // Paste button (Receive tab)
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      receiveTextArea.value = text;
    } catch (err) {
      alert('Failed to read clipboard.');
    }
  });

  // Run button (Receive tab)
  runBtn.addEventListener('click', () => {
    const code = receiveTextArea.value;
    if (!code) {
      alert('No code to run.');
      return;
    }

    if (!openedDirectoryName) {
      alert('No directory opened. Please open a folder first.');
      return;
    }

    // Here we would write 'code' to script.sh inside the opened directory and run it.
    // This is not possible directly in a Chrome extension due to security.
    // Placeholder function call:
    runLocalScript(code, openedDirectoryName);

    alert('Script "script.sh" would have been written and executed now (simulation).');
  });

  // File/Folder selection (Tree tab)
  selectFolderBtn.addEventListener('click', () => {
    folderInput.click();
  });

  folderInput.addEventListener('change', () => {
    const rawFiles = Array.from(folderInput.files);
    const filteredFiles = rawFiles.filter(file => {
      const parts = file.webkitRelativePath.split('/');
      return !parts.some(part => IGNORED_DIRS.has(part));
    });

    fileList = filteredFiles;

    if (fileList.length > 0) {
      // Derive openedDirectoryName from the first file's top-level dir
      const firstPath = fileList[0].webkitRelativePath;
      const topDir = firstPath.split('/')[0];
      openedDirectoryName = topDir;
    } else {
      openedDirectoryName = null;
    }

    const treeData = buildFileTree(fileList);
    renderFileTree(treeData, fileTreeContainer);
  });

  function buildFileTree(files) {
    const root = {};
    for (const file of files) {
      const parts = file.webkitRelativePath.split('/');
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = (i === parts.length - 1) ? { __file: file } : {};
        }
        current = current[part];
      }
    }
    return root;
  }

  function renderFileTree(tree, container) {
    container.innerHTML = '';
    const ul = document.createElement('ul');
    appendTreeNodes(tree, ul);
    container.appendChild(ul);
  }

  function appendTreeNodes(treeNode, ul) {
    for (const key in treeNode) {
      const li = document.createElement('li');
      const value = treeNode[key];
      if (value.__file) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.filepath = value.__file.webkitRelativePath;

        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(' ' + key));
      } else {
        li.appendChild(document.createTextNode(key));
        const childUl = document.createElement('ul');
        appendTreeNodes(value, childUl);
        li.appendChild(childUl);
      }
      ul.appendChild(li);
    }
  }

  addFilesBtn.addEventListener('click', async () => {
    const checkedBoxes = fileTreeContainer.querySelectorAll('input[type=checkbox]:checked');
    if (checkedBoxes.length === 0) {
      alert('No files selected.');
      return;
    }

    for (const checkbox of checkedBoxes) {
      const path = checkbox.dataset.filepath;
      const file = fileList.find(f => f.webkitRelativePath === path);
      if (!file) continue;

      const content = await readFileAsText(file);
      textArea.value += `\n---\nFile: ${path}\n${content}\n`;
    }
  });

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Placeholder for running a local script - to be implemented via native messaging or server
  function runLocalScript(code, directoryName) {
    // Implement native messaging or a backend service
    console.log(`Would run script.sh in ${directoryName} with content:`, code);
    // For now, just log it.
  }

  // Resizing logic
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    document.documentElement.style.cursor = 'col-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const dx = startX - e.clientX;
    const newWidth = Math.max(200, startWidth + dx);
    sidebar.style.width = newWidth + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.documentElement.style.cursor = '';
    }
  });
})();

