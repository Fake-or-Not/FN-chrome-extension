/**
 * Code ment to make a change.
 *
 * Facebook - Show research data available for each shared post shown on the screen.
 *
 * The code gets base url for all the shared content and sends it to Fake-or-Not server.
 * Server checks if any information for the post is available.
 * If available, server responds if the content is Real or Fake,
 * which is then shown on the screen in an area above share button.
 *
 *
 * Strict Note: Let's pledge not to use this extension to capture any user data.
 */

/**
 * Injecting stylesheet through javascript
 */

// let style = document.createElement("link");
// style.rel = "stylesheet";
// style.type = "text/css";
// style.href = chrome.extension.getURL("src/content/facebook/style.css");
// (document.head || document.documentElement).appendChild(style);

let fbContentAreaElem = document.getElementById("contentArea");
let shrdContentClass = "._sds";
let observer = new MutationObserver(mutations => {
  let sharePostData = [];
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      // Track only elements, skip other nodes (e.g. text nodes)
      if (!(node instanceof HTMLElement)) continue;
      for (let elem of node.querySelectorAll(shrdContentClass)) {
        let aElem = elem.querySelector(".a_q_joqo85y>.fcg>a");
        let basePostURL = aElem.getAttribute("href");
        const urlRegex = /^(\/(.*)\/.+\/([0-9]{10,}))(\/$|\/?|$)/g;
        // console.log(basePostURL);
        let matches = urlRegex.exec(basePostURL);
        console.log(matches);
        if (matches !== null) {
          if (matches[1] != "" && matches[2] != "") {
            let post_url = matches[1];
            let poster = matches[2];
            let post_id = matches[3];
            let post_type = "photo";
            let repoDiv = document.createElement("div");
            repoDiv.setAttribute("id", "FN_" + uuid);
            repoDiv.setAttribute("class", "shr_fon");
            elem.appendChild(repoDiv);
            sharePostData.push({
              post_id,
              post_url,
              post_type,
              poster
            });
          }
        }
      }
    }
  }
  if (sharePostData.length != 0) {
    //hiting to a tempropry url
    postData("https://example.com", sharePostData).then(data => {
      console.log(data); // JSON data parsed by `response.json()` call
    });
  }
});

async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json"
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}
// observe everything except attributes
observer.observe(fbContentAreaElem, {
  childList: true, // observe direct children
  subtree: true, // and lower descendants too
  characterDataOldValue: true // pass old data to callback
});
