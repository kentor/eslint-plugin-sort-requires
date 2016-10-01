'use strict';

module.exports = function transformer(file, api) {
  var j = api.jscodeshift;
  var root = j(file.source);
  var copy = j(file.source);

  function last(array) {
    return array[array.length - 1];
  }

  // Group paths into array of arrays
  function getPathGroups(rootCollection) {
    var paths = [];
    var pathGroups = [];

    rootCollection.find(j.VariableDeclaration).filter(function (path) {
      return j(path).find(j.CallExpression, {
        callee: { name: 'require' }
      }).size();
    }).forEach(function (path) {
      paths.push(path);
    });

    if (paths.length) {
      paths.reduce(function (memo, path) {
        var lastGroup = last(memo);
        if (!lastGroup || path.node.loc.start.line - last(lastGroup).node.loc.end.line != 1) {
          memo.push([path]);
        } else {
          lastGroup.push(path);
        }
        return memo;
      }, pathGroups);
    }

    return pathGroups;
  }

  var origPathGroups = getPathGroups(root);
  var sortedPathGroups = getPathGroups(copy);

  // Sort each group
  sortedPathGroups.forEach(function (group) {
    group.sort(function (a, b) {
      var nodeA = j(a).toSource().toLowerCase();
      var nodeB = j(b).toSource().toLowerCase();
      return nodeA < nodeB ? -1 : nodeA > nodeB ? 1 : 0;
    });
  });

  origPathGroups.forEach(function (group, x) {
    group.forEach(function (p, y) {
      j(p).replaceWith(sortedPathGroups[x][y].node);
    });
  });

  return root.toSource();
};