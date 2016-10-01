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
    const pathGroups = [];

    rootCollection
      .find(j.VariableDeclaration)
      .filter(path => j(path).find(j.CallExpression, {
        callee: { name: 'require' }
      }).size())
      .forEach(path => {
        paths.push(path);
      });

    if (paths.length) {
      paths.reduce((memo, path) => {
        const lastGroup = last(memo);
        if (
          !lastGroup ||
          path.node.loc.start.line - last(lastGroup).node.loc.end.line != 1
        ) {
          memo.push([path]);
        } else {
          lastGroup.push(path);
        }
        return memo;
      }, pathGroups);
    }

    return pathGroups;
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
