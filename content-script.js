(() => {
  const LocalStorage = {
    ProjectPath: `clickToReact-projectPath-${window.location.host}`,
    Editor: `clickToReact-editor-${window.location.host}`,
  }

  let elementOverlay;
  let elementOverlayContent;
  let elementTooltip;
  let timeoutTooltip;
  let editor = localStorage.getItem(LocalStorage.Editor) ?? 'vscode';

  const getEditorConfiguration = (editor) => {
    switch (editor) {
      case "vscode":
        return {
          url: 'vscode://file://{{fileName}}:{{lineNumber}}:{{columnNumber}}',
        };

      default:
        return {
          url: '{{fileName}}:{{lineNumber}}',
        };

    }
  }

  const getFilePathToSource = (debugSource) => {
    if (!debugSource) return null;
    let fileName = debugSource.fileName;

    if (fileName.startsWith("<[project]")) {
      fileName = fileName.replace("<[project]", "");
      fileName = fileName.replace(">", "");
      fileName = `.${fileName}`;
    }

    return getEditorConfiguration(editor).url.replace('{{fileName}}', fileName)
      .replace('{{lineNumber}}', debugSource.lineNumber)
      .replace('{{columnNumber}}', debugSource.columnNumber);
  };

  const getPathToSourceFromTarget = (clickedElement) => {
    for (const key in clickedElement) {
      if (clickedElement[key]?.constructor.name === "FiberNode") {
        const fiberNode = clickedElement[key];
        if (!fiberNode) continue;

        // check for debugSource recursively under debugOwner
        let debugOwner = fiberNode._debugOwner;
        let debugSource = fiberNode._debugSource;
        do {
          if (!debugOwner) break;
          debugSource = debugOwner._debugSource;
          debugOwner = debugOwner._debugOwner;
        } while (!debugSource);

        return getFilePathToSource(debugSource);
      }
    }
  };

  const handleClick = (event) => {
    if (!event.altKey) return;

    event.stopPropagation();
    event.preventDefault();

    let pathToSource = getPathToSourceFromTarget(event.target);
    if (!pathToSource) return;

    const localStorageKey = LocalStorage.ProjectPath;

    if (!pathToSource.includes("file://")) {
      // we are not able to get in an external file, copy the path and return
      const sanitizedUrl = pathToSource.replace('[project]/', '')
      navigator.clipboard.writeText(sanitizedUrl);

      // show the tooltip
      elementTooltip.innerHTML = `Path copied to clipboard: ${sanitizedUrl}`;
      elementTooltip.style.opacity = "1";
      elementTooltip.style.transform = "translateY(0)";

      clearTimeout(timeoutTooltip);
      timeoutTooltip = setTimeout(() => {
        elementTooltip.style.opacity = "0";
        elementTooltip.style.transform = "translateY(-1rem)";
      }, 2000);


      return;
    }

    if (pathToSource.includes("file://[project]/")) {
      let projectPath = localStorage.getItem(localStorageKey);
      if (!projectPath) {
        projectPath = prompt(
          "Enter absolute path to the project root directory. This will be saved in localStorage if you want to modify it later.",
        );
        localStorage.setItem(localStorageKey, projectPath);
      }

      pathToSource = pathToSource.replace(
        "file://[project]/",
        `file://${projectPath}/`,
      );
    }

    if (pathToSource.includes("file://./")) {
      let projectPath = localStorage.getItem(localStorageKey);
      if (!projectPath) {
        projectPath = prompt(
          "Enter absolute path to the project root directory. This will be saved in localStorage if you want to modify it later.",
        );
        localStorage.setItem(localStorageKey, projectPath);
      }

      pathToSource = pathToSource.replace(
        "file://./",
        `file://${projectPath}/`,
      );
    }

    window.location.assign(pathToSource);
  };

  const handleMouseMove = (event) => {
    if (!event.altKey) {
      elementOverlay.style.display = "none";
      document.body.style.cursor = "";

      return;
    }

    const pathSplits = getPathToSourceFromTarget(event.target)?.split("/");
    if (!pathSplits) return;
    let displayPath = pathSplits.slice(-3).join("/");

    if (pathSplits.length > 3) {
      displayPath = ".../" + displayPath;
    }

    elementOverlayContent.innerHTML = displayPath;

    // change the cursor to pointer
    document.body.style.cursor = "pointer";

    // highlight the element with a border, add a class
    const hoveredElement = event.target;
    // show the overlay
    elementOverlay.style.display = "block";
    const boundingRect = hoveredElement.getBoundingClientRect();
    elementOverlay.style.top = `${boundingRect.top}px`;
    elementOverlay.style.left = `${boundingRect.left}px`;
    elementOverlay.style.width = `${boundingRect.width}px`;
    elementOverlay.style.height = `${boundingRect.height}px`;
  };

  const handleKeyUp = (event) => {
    if (event.key === "Alt") {
      elementOverlay.style.display = "none";
      document.body.style.cursor = "";
    }
  };

  if (!window.___clickToReactIsContentLoaded) {
    // append a div to show the overlay
    elementOverlay = document.createElement("div");
    elementOverlay.style.position = "fixed";
    elementOverlay.style.top = "0";
    elementOverlay.style.left = "0";
    elementOverlay.style.width = "100%";
    elementOverlay.style.height = "100%";
    elementOverlay.style.background = "#56CCF255";
    elementOverlay.style.border = "1px dashed #009CFF";
    elementOverlay.style.borderRadius = "4px";
    elementOverlay.style.zIndex = "9999";
    elementOverlay.style.display = "none";
    elementOverlay.style.pointerEvents = "none";
    elementOverlay.style.transition = "all 0.1s cubic-bezier(.5,0,.25,1)";


    // add child div to elementOverlay with a list of tags
    elementOverlayContent = document.createElement("div");
    elementOverlayContent.style.position = "absolute";
    elementOverlayContent.style.top = "calc(100% + 4px)";
    elementOverlayContent.style.left = "0";
    elementOverlayContent.style.width = "min-content";
    elementOverlayContent.style.padding = "8px";
    elementOverlayContent.style.background = "#33333fee";
    elementOverlayContent.style.color = "#fff";
    elementOverlayContent.style.fontSize = "12px";
    elementOverlayContent.style.fontFamily = "monospace";
    elementOverlayContent.style.textAlign = "left";
    elementOverlayContent.style.borderRadius = "4px";
    elementOverlayContent.style.pointerEvents = "none";
    elementOverlayContent.style.whiteSpace = "nowrap";
    elementOverlayContent.style.overflow = "hidden";
    elementOverlayContent.style.textOverflow = "ellipsis";
    elementOverlayContent.style.transition =
      "all 0.1s cubic-bezier(.5,0,.25,1)";
    elementOverlay.appendChild(elementOverlayContent);

    document.body.appendChild(elementOverlay);

    // append a div to show the tooltip
    elementTooltip = document.createElement("div");
    elementTooltip.style.position = "fixed";
    elementTooltip.style.top = "1rem";
    elementTooltip.style.right = "1rem";
    elementTooltip.style.maxWidth = "350px";
    elementTooltip.style.padding = "0.5rem";
    elementTooltip.style.fontFamily = "monospace";
    elementTooltip.style.fontSize = "small";

    elementTooltip.style.height = "max-content";
    elementTooltip.style.background = "#56CCF255";
    elementTooltip.style.backdropFilter = "blur(10px)";
    elementTooltip.style.color = "#333";
    elementTooltip.style.border = "1px dashed #009CFF";
    elementTooltip.style.borderRadius = "4px";
    elementTooltip.style.zIndex = "9999";
    elementTooltip.style.display = "block";
    elementTooltip.style.pointerEvents = "none";
    elementTooltip.style.opacity = "0";
    elementTooltip.style.transform = "translateY(-1rem)";
    elementTooltip.style.transition = "all 0.1s cubic-bezier(.5,0,.25,1)";

    document.body.appendChild(elementTooltip);

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keyup", handleKeyUp);

    window.___clickToReactIsContentLoaded = true;
  }
})();
