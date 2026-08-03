/* ============================================================
   Open Source section: real data only, fetched live.

   Everything shown in this section comes from api.github.com at page load.
   There is no hand-typed figure anywhere in here, and no fallback that
   invents a number: if the request fails, the fields stay as em dashes and
   the notice says so.

   Deliberately NOT shown: stars, commit totals and the contribution
   calendar. Stars and forks are zero on a new account and read as failure
   rather than as "early". Commit totals and the calendar are not in the
   public REST API at all, they need a GraphQL token, which cannot ship in
   a static page. A number that can't be fetched doesn't belong on a
   credibility section.
   ============================================================ */
(function () {
  "use strict";

  var GITHUB_USER = "CJTHEGREAT123";

  var root = document.querySelector("[data-gh-root]");
  if (!root) return;

  var notice = root.querySelector("[data-gh-notice]");
  var list = root.querySelector("[data-gh-repos]");

  var setStat = function (key, value) {
    var el = root.querySelector('[data-gh="' + key + '"]');
    if (el && value !== null && value !== undefined && value !== "") el.textContent = value;
  };

  var fail = function (msg) {
    if (notice) notice.innerHTML = "<strong>GitHub unavailable.</strong> " + msg;
    if (list) list.innerHTML = '<li class="repo repo--empty"><span class="ph__label">Could not load repositories</span></li>';
  };

  var profileURL = "https://github.com/" + GITHUB_USER;
  Array.prototype.forEach.call(document.querySelectorAll("[data-gh-profile]"), function (a) {
    a.href = profileURL;
    a.removeAttribute("aria-disabled");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });

  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

  fetch("https://api.github.com/users/" + encodeURIComponent(GITHUB_USER))
    .then(function (r) { if (!r.ok) throw new Error("profile " + r.status); return r.json(); })
    .then(function (user) {
      setStat("repos", user.public_repos);
      // "1 Public repositories" reads as a bug; agree the label with the count.
      var repoLabel = root.querySelector('[data-gh-label="repos"]');
      if (repoLabel && user.public_repos === 1) repoLabel.textContent = "Public repository";
      if (user.created_at) {
        var d = new Date(user.created_at);
        setStat("since", MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear());
      }
      return fetch("https://api.github.com/users/" + encodeURIComponent(GITHUB_USER) +
                   "/repos?per_page=100&sort=pushed");
    })
    .then(function (r) { if (!r.ok) throw new Error("repos " + r.status); return r.json(); })
    .then(function (repos) {
      if (!Array.isArray(repos)) throw new Error("unexpected payload");
      if (!list) return;

      var own = repos.filter(function (rp) { return !rp.fork; });
      if (!own.length) {
        list.innerHTML = '<li class="repo repo--empty"><span class="ph__label">No public repositories yet</span></li>';
        return;
      }

      list.innerHTML = "";
      own.slice(0, 4).forEach(function (rp) {
        var li = document.createElement("li");
        li.className = "repo";

        var a = document.createElement("a");
        a.className = "repo__name";
        a.href = rp.html_url; a.target = "_blank"; a.rel = "noopener noreferrer";
        a.textContent = rp.name;

        var desc = document.createElement("span");
        desc.className = "repo__desc";
        // No description on the repo is common and fine; say so rather than
        // leaving a gap that looks like a rendering bug.
        desc.textContent = rp.description || "No description yet";
        if (!rp.description) desc.classList.add("repo__desc--empty");

        var meta = document.createElement("span");
        meta.className = "repo__stars";
        meta.textContent = rp.language || "–";

        li.appendChild(a); li.appendChild(desc); li.appendChild(meta);
        list.appendChild(li);
      });
    })
    .catch(function (err) {
      fail("Could not read the profile (" + err.message + "). Nothing is estimated in its place.");
    });
})();
