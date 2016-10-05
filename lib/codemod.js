module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const copy = j(file.source);

  function last(array) {
    return array[array.length - 1];
  }

  // Group paths into array of arrays
  function getPathGroups(rootCollection) {
    const paths = [];
    const partitionedPaths = [];

    rootCollection
      .find(j.VariableDeclaration)
      .filter(path => j(path).find(j.CallExpression, {
        callee: { name: 'require' }
      }).size())
      .forEach(path => {
        paths.push(path);
      });

    if (paths.length) {
      partitionedPaths.push([paths[0]]);

      paths.reduce((lastPath, path) => {
        if (path.node.loc.start.line - lastPath.node.loc.end.line === 1) {
          last(partitionedPaths).push(path);
        } else {
          partitionedPaths.push([path]);
        }
        return path;
      });
    }

    return partitionedPaths;
  }

  const origPathGroups = getPathGroups(root);
  const sortedPathGroups = getPathGroups(copy);

  // Sort each group
  sortedPathGroups.forEach(group => {
    group.sort((a, b) => {
      const nodeA = j(a).toSource().toLowerCase();
      const nodeB = j(b).toSource().toLowerCase();
      return nodeA < nodeB ? -1 : nodeA > nodeB ? 1 : 0;
    });
  });

  origPathGroups.forEach((group, x) => {
    group.forEach((p, y) => {
      j(p).replaceWith(sortedPathGroups[x][y].node);
    })
  });

  return root.toSource();
};
