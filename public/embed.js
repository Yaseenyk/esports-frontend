/* Esports Hub embed loader. Finds <div data-esports-hub="slug" data-view="standings|bracket|schedule|matches" data-theme="dark|light" data-team="">
   and puts a live widget in it. Reads nothing from your page; only a height number is received from the widget. */
(function (w, d) {
  var O = "https://esports.streamerosai.com", F = [], n = 0;
  function mk(e) {
    var s = e.getAttribute("data-esports-hub") || "", v = e.getAttribute("data-view"), t = e.getAttribute("data-theme"),
      m = (e.getAttribute("data-team") || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 60), i;
    if (!/^[a-z0-9-]{3,40}$/.test(s) || e.getAttribute("data-eh-ready")) return;
    e.setAttribute("data-eh-ready", "1");
    v = /^(standings|bracket|schedule|matches)$/.test(v) ? v : "standings";
    t = t === "light" ? "light" : "dark";
    i = d.createElement("iframe");
    n++;
    i.src = O + "/embed/?e=" + s + "&v=" + v + "&theme=" + t + (m ? "&team=" + encodeURIComponent(m) : "") + "&id=eh" + n;
    i.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox");
    i.setAttribute("title", "Live on Esports Hub");
    i.setAttribute("loading", "lazy");
    i.setAttribute("scrolling", "no");
    i.style.cssText = "border:0;width:100%;max-width:100%;display:block;height:480px";
    e.appendChild(i);
    F.push(i);
  }
  w.addEventListener("message", function (e) {
    var x = e.data, k, h;
    if (e.origin !== O || !x || x.type !== "eh-embed-height" || typeof x.height !== "number" || !isFinite(x.height)) return;
    h = Math.min(2000, Math.max(120, Math.round(x.height)));
    for (k = 0; k < F.length; k++) if (F[k].contentWindow === e.source) F[k].style.height = h + "px";
  });
  function go() {
    var l = d.querySelectorAll("[data-esports-hub]"), k;
    for (k = 0; k < l.length; k++) mk(l[k]);
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", go); else go();
})(window, document);
