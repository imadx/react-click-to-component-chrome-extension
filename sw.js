var tabId = null;

chrome.webNavigation.onBeforeNavigate.addListener(async () => {
  chrome.action.setIcon({
    path: "assets/icon-48-inactive.png",
  });
});

chrome.webNavigation.onDOMContentLoaded.addListener(async () => {
  const world = "MAIN";
  const scripts = ["content-script.js"];
  const id = Date.now().toString();

  // get the tabId
  [{ id: tabId }] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  // register script
  await chrome.scripting.registerContentScripts([
    {
      id,
      js: scripts,
      persistAcrossSessions: true,
      runAt: "document_idle",
      matches: ["http://*/*"],
      allFrames: true,
      world,
    },
  ]);

  // execute script
  await chrome.scripting.executeScript({
    target: { tabId },
    files: scripts,
    world,
  });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world,
    func: () => {
      return {
        isReady: window.___clickToReactIsContentLoaded,
      };
    },
  });

  if (result.isReady) {
    chrome.action.setIcon({
      path: "assets/icon-48.png",
    });
  }
});
