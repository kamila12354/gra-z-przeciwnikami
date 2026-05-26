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

export function createAlert(message, type = "info") {
  return createElement("div", {
    className: `alert alert-${type}`,
    attributes: {
      role: type === "danger" ? "alert" : "status"
    },
    text: message
  });
}

export function createLoadingView(message = "Ładowanie danych aplikacji...") {
  return createElement("section", {
    className: "text-center py-5",
    attributes: {
      "aria-live": "polite"
    },
    children: [
      createElement("div", {
        className: "spinner-border text-primary mb-3",
        attributes: {
          role: "status",
          "aria-hidden": "true"
        }
      }),
      createElement("p", {
        className: "text-body-secondary mb-0",
        text: message
      })
    ]
  });
}

export function createErrorView(message) {
  return createElement("section", {
    className: "py-5",
    attributes: {
      "aria-labelledby": "error-title"
    },
    children: [
      createElement("h1", {
        className: "h3 mb-3",
        id: "error-title",
        text: "Nie udało się uruchomić aplikacji"
      }),
      createAlert(message, "danger")
    ]
  });
}
