const getNodes = (selector) => {
  const nodes = document.querySelectorAll(selector);
  if (nodes.length === 0) {
    return null;
  }
  if (nodes.length === 1) {
    return nodes[0];
  }
  return nodes;
};
