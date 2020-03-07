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

const fbContentAreaElem = document.getElementById("contentArea");
const shrdContentClass = "._sds";
const observer = new MutationObserver(mutations => {
  let sharePostData = [];
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      // Track only elements, skip other nodes (e.g. text nodes)
      if (!(node instanceof HTMLElement)) continue;
      for (let elem of node.querySelectorAll(shrdContentClass)) {
        let aElem = elem.querySelector(".a_q_joqo85y>.fcg>a");
        let basePostURL = aElem.getAttribute("href");
        const photoRegex = /\/([^\/]+)\/(photos)\/([^\/]{0,})\/([0-9]+)/g;
        const videoRegex = /\/([^\/]+)\/(videos)\/([0-9]+)/g;
        let post = { post_id: 0, post_type: "tmp" };
        if (photoRegex.test(basePostURL)) {
          post = processPhotoURL(basePostURL);
        } else if (videoRegex.test(basePostURL)) {
          post = processVideoURL(basePostURL);
        } else {
          continue;
        }
        const repoDiv = document.createElement("div");
        repoDiv.setAttribute("id", "FN_" + post.post_id + "_" + post.post_type);
        repoDiv.setAttribute("class", "shr_fon");
        elem.appendChild(repoDiv);
        sharePostData.push(post);
      }
    }
  }
  if (sharePostData.length != 0) {
    postData("https://fake-or-not.herokuapp.com/addPost", sharePostData).then(
      data => {
        processResponse(data); // JSON data parsed by `response.json()` call
      }
    );
  }
});

const processResponse = resp => {
  // resp
  // logic to render here.
  resp.forEach(renderResponse);
};

const renderResponse = (post, index) => {
  const rendElem = document.getElementById(
    "FN_" + post.post_id + "_" + post.post_type
  );
  rendElem.style.backgroundColor = "red"; //tmp
  rendElem.style.minHeight = "10px"; //tmp
  rendElem.style.minWidth = "100%"; //tmp
};

const processPhotoURL = url => {
  const photoRegex = /\/([^\/]+)\/(photos)\/([^\/]{0,})\/([0-9]+)/g;
  const matches = photoRegex.exec(url);
  return {
    post_url: matches[0],
    poster: matches[1],
    post_type: matches[2],
    gallery_slug: matches[3],
    post_id: matches[4]
  };
};

const processVideoURL = url => {
  const videoRegex = /\/([^\/]+)\/(videos)\/([0-9]+)/g;
  const matches = videoRegex.exec(url);
  return {
    post_url: matches[0],
    poster: matches[1],
    post_type: matches[2],
    post_id: matches[3]
  };
};

const postData = async (url, data = {}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
// observe everything except attributes
observer.observe(fbContentAreaElem, {
  childList: true, // observe direct children
  subtree: true, // and lower descendants too
  characterDataOldValue: true // pass old data to callback
});
