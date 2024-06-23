(() => {
  let elementOverlay;
  let elementOverlayContent;

  const getFilePathToSource = (debugSource) => {
    if (!debugSource) return null;
    let fileName = debugSource.fileName;

    if (fileName.startsWith("<[project]")) {
      fileName = fileName.replace("<[project]", "");
      fileName = fileName.replace(">", "");
      fileName = `.${fileName}`;
    }

    return `vscode://file://${fileName}:${debugSource.lineNumber}:${debugSource.columnNumber}`;
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

        const pathToSource = getFilePathToSource(debugSource);
        return pathToSource;
      }
    }
  };

  const handleClick = (event) => {
    if (!event.altKey) return;

    const pathToSource = getPathToSourceFromTarget(event.target);
    if (!pathToSource) return;
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

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keyup", handleKeyUp);

    window.___clickToReactIsContentLoaded = true;
  }
})();
