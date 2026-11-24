/**
 * Runs inline in <head> on every page, before React hydrates. Chrome's built-in Google Translate swaps text nodes for <font> elements,
 * and React can then crash with "Failed to execute 'removeChild'/'insertBefore' on 'Node'" when it updates a part the translator moved
 * (Brazilian visitors of the Free Fire points table had the page translated, Nov 2026). The two patches make those calls tolerate a
 * moved node.
 *
 * Not handled here on purpose: when the translator finishes before React hydrates, React reports a hydration mismatch (minified errors
 * 418, 423 and 425) and renders the page again on the client, which works. Swallowing those reports through window.reportError was
 * tried and made React fail later with error 329 and drop a click, so they stay visible as page errors.
 */
export const TRANSLATE_GUARD = `(function(){if(typeof Node!=='function'||!Node.prototype)return;var r=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c.parentNode!==this){return c;}return r.apply(this,arguments);};var i=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this){return i.call(this,n,null);}return i.apply(this,arguments);};})();`;
