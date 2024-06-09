(() => {
  let elementOverlay;

  const getFilePathToSource = (debugSource) => {
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

        // check for debugSource recursively under debugOwner
        let debugOwner = fiberNode._debugOwner;
        let debugSource = fiberNode._debugSource;
        do {
          debugSource = debugOwner._debugSource;
          debugOwner = debugOwner._debugOwner;
          if (!debugOwner) break;
        } while (!debugSource);

        const pathToSource = getFilePathToSource(debugSource);
        return pathToSource;
      }
    }
  };

  const handleClick = (event) => {
    if (!event.altKey) return;

    const pathToSource = getPathToSourceFromTarget(event.target);
    window.location.assign(pathToSource);
  };

  const handleMouseMove = (event) => {
    if (!event.altKey) {
      elementOverlay.style.display = "none";
      document.body.style.cursor = "";

      return;
    }

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
    document.body.appendChild(elementOverlay);

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);

    window.___clickToReactIsContentLoaded = true;
  }
})();
