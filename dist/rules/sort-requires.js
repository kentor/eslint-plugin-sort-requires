'use strict';

module.exports = {
  meta: {
    fixable: 'code'
  },

  create: function create(context) {
    var sourceCode = context.getSourceCode();

    var hasRequire = /require\(/;
    var groups = [];
    var previousNode = void 0;

    function check(group) {
      var texts = group.map(function (decl) {
        return sourceCode.getText(decl);
      });

      if (!isSorted(texts)) {
        texts.sort(function (a, b) {
          var aLower = a.toLowerCase();
          var bLower = b.toLowerCase();
          return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
        });

        context.report({
          loc: { start: group[0].loc.start, end: last(group).loc.end },
          message: 'This group of requires is not sorted',
          fix: function fix(fixer) {
            return fixer.replaceTextRange([group[0].start, last(group).end], texts.join('\n'));
          }
        });
      }
    }

    function last(ary) {
      return ary[ary.length - 1];
    }

    function shouldStartNewGroup(node, previousNode) {
      if (!previousNode) return true;
      if (node.parent !== previousNode.parent) return true;

      var lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      var lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    function isSorted(ary) {
      return ary.every(function (value, idx) {
        return idx === 0 || ary[idx - 1].toLowerCase() <= value.toLowerCase();
      });
    }

    return {
      VariableDeclaration: function VariableDeclaration(node) {
        if (!hasRequire.test(sourceCode.getText(node))) return;

        if (shouldStartNewGroup(node, previousNode)) {
          groups.push([node]);
        } else {
          last(groups).push(node);
        }

        previousNode = node;
      },
      'Program:exit': function ProgramExit(node) {
        groups.forEach(check);
      }
    };
  }
};