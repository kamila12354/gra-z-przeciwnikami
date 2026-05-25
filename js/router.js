export class Router {
  constructor({ app, defaultRoute, navLinks, routes }) {
    this.app = app;
    this.defaultRoute = defaultRoute;
    this.navLinks = navLinks;
    this.routes = routes;
  }

  start() {
    window.addEventListener("hashchange", () => this.renderCurrentRoute());

    if (!window.location.hash) {
      window.location.hash = this.defaultRoute;
      return;
    }

    this.renderCurrentRoute();
  }

  renderCurrentRoute() {
    const hash = window.location.hash || this.defaultRoute;
    const matchedRoute = this.findRoute(hash);

    if (!matchedRoute) {
      window.location.hash = this.defaultRoute;
      return;
    }

    this.app.replaceChildren(matchedRoute.render(matchedRoute.params));
    document.title = `${matchedRoute.title} | Gra z Przeciwnikami`;
    this.updateActiveNavigation(hash);
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
}

