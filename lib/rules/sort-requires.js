'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    const hasRequire = /require\(/;
    const groups = [];
    let previousNode;

    function check(group) {
      const texts = group.map(decl => sourceCode.getText(decl));

      if (!isSorted(texts)) {
        texts.sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
        });

        context.report({
          loc: { start: group[0].loc.start, end: last(group).loc.end },
          message: 'This group of requires is not sorted',
          fix: fixer => fixer.replaceTextRange(
            [group[0].start, last(group).end],
            texts.join('\n')
          ),
        });
      }
    }

    function last(ary) {
      return ary[ary.length - 1];
    }

    function shouldStartNewGroup(node, previousNode) {
      if (!previousNode) return true;
      if (node.parent !== previousNode.parent) return true;

      const lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      const lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    function isSorted(ary) {
      return ary.every((value, idx) =>
        idx === 0 || ary[idx - 1].toLowerCase() <= value.toLowerCase()
      );
    }

    return {
      VariableDeclaration(node) {
        if (!hasRequire.test(sourceCode.getText(node))) return;

        if (shouldStartNewGroup(node, previousNode)) {
          groups.push([node]);
        } else {
          last(groups).push(node);
        }

        previousNode = node;
      },

      'Program:exit'(node) {
        groups.forEach(check);
      },
    };
  },
};
