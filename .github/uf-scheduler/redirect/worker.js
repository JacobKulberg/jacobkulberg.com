// uf.jacobkulberg.com: short link to UF Scheduler. Deploy: npx wrangler deploy

const APP = "https://www.jacobkulberg.com/projects/uf-scheduler/";

export default {
  fetch(request) {
    // Keep any query string (e.g. ?utm_source=...) on the way through
    const { search } = new URL(request.url);
    return Response.redirect(APP + search, 302);
  },
};
