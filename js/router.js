export class Router {
  constructor({ app, defaultRoute, navLinks, routes }) {
    this.app = app;
    this.defaultRoute = defaultRoute;
    this.navLinks = navLinks;
    this.routes = routes;
    this.currentView = null;
  }

  start() {
    window.addEventListener("hashchange", () => this.renderCurrentRoute());

    if (!window.location.hash) {
      window.location.hash = this.defaultRoute;
      return;
    }

    this.renderCurrentRoute();
  }

  async renderCurrentRoute() {
    const hash = window.location.hash || this.defaultRoute;
    const matchedRoute = this.findRoute(hash);

    if (!matchedRoute) {
      window.location.hash = this.defaultRoute;
      return;
    }

    try {
      const view = await matchedRoute.render(matchedRoute.params);
      this.destroyCurrentView();
      this.app.replaceChildren(view);
      this.currentView = view;
      document.title = `${matchedRoute.title} | Gra z Przeciwnikami`;
      this.updateActiveNavigation(hash);
    } catch (error) {
      this.app.replaceChildren(this.createRouteError(error));
    }
  }

  destroyCurrentView() {
    if (typeof this.currentView?.destroy === "function") {
      this.currentView.destroy();
    }
  }

  findRoute(hash) {
    for (const route of this.routes) {
      const match = hash.match(route.pattern);

      if (match) {
        return {
          ...route,
          params: match.groups || {}
        };
      }
    }

    return null;
  }

  updateActiveNavigation(hash) {
    this.navLinks.forEach((link) => {
      const isActive = hash.startsWith(link.getAttribute("href"));
      link.classList.toggle("active", isActive);
      link.toggleAttribute("aria-current", isActive);
    });
  }

  createRouteError(error) {
    const section = document.createElement("section");
    section.className = "py-5";

    const title = document.createElement("h1");
    title.className = "h3 mb-3";
    title.textContent = "Wystąpił błąd widoku";

    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.role = "alert";
    alert.textContent = error.message || "Spróbuj odświeżyć aplikację.";

    section.appendChild(title);
    section.appendChild(alert);

    return section;
  }
}
