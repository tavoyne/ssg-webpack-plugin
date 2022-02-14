import app from "./components/app.js";

const posts = require.context("./posts", false, /\.js$/u, "lazy");

// Tracks if render() is executing.
let isRendering;
isRendering = false;

const render = async () => {
  // Returns if render() is already executing.
  if (isRendering) return;
  isRendering = true;

  // Can be e.g. `/posts/post-1`.
  const { pathname } = window.location;

  // Converts pathname to file path: `/posts/post-1` --> `./post-1.js`.
  const relativeFilePath = `${pathname.replace(/^\/posts/u, ".")}.js`;

  const newRootElement = document.createElement("div");
  newRootElement.id = "root";

  if (posts.keys().includes(relativeFilePath)) {
    // Lazy loads the post.
    const { default: post } = await posts(relativeFilePath);

    // Builds and injects the HTML.
    const postElement = post();
    const appElement = app(postElement);
    newRootElement.innerHTML = appElement;

    newRootElement.querySelectorAll("a").forEach((linkElement) => {
      linkElement.addEventListener("click", (evt) => {
        // We don't want the event to trigger a full reload.
        evt.preventDefault();

        // Changes the pathname to mimic true navigation.
        history.pushState(null, null, evt.target.href);

        render();
      });
    });
  } else {
    newRootElement.innerHTML = "<h1>Not found</h1>";
  }

  const rootElement = document.getElementById("root");

  document.body.replaceChild(newRootElement, rootElement);

  isRendering = false;
};

render();
