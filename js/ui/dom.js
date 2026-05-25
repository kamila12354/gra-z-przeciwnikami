export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  const {
    attributes = {},
    children = [],
    className = "",
    text = ""
  } = options;

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  children.forEach((child) => {
    element.appendChild(child);
  });

  return element;
}

export function createPageHeader(title, description, actions = []) {
  const textColumn = createElement("div", {
    children: [
      createElement("h1", {
        className: "h3 mb-2",
        text: title
      }),
      createElement("p", {
        className: "text-body-secondary mb-0",
        text: description
      })
    ]
  });

  const headerChildren = [textColumn];

  if (actions.length > 0) {
    headerChildren.push(createElement("div", {
      className: "d-flex flex-wrap gap-2",
      children: actions
    }));
  }

  return createElement("header", {
    className: "page-heading d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4",
    children: headerChildren
  });
}

export function createEmptyState(title, description) {
  return createElement("section", {
    className: "empty-state text-center border rounded bg-white p-4 p-md-5",
    attributes: {
      "aria-label": title
    },
    children: [
      createElement("h2", {
        className: "h5 mb-2",
        text: title
      }),
      createElement("p", {
        className: "text-body-secondary mb-0",
        text: description
      })
    ]
  });
}

