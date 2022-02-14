const navigation = [
  '<ul><li><a href="/posts/post-1">Post 1</a></li><li><a href="/posts/post-2">',
  "Post 2</a></li></ul>",
].join("");

export default (children) => {
  return [navigation, children].join("");
};
