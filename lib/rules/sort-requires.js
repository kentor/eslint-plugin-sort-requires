'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const hasRequire = /require\(/;
    const sourceCode = context.getSourceCode();
    let previousDeclaration;
    let previousNode;

    function shouldStartNewGroup(node, previousNode) {
      const lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      const lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    function repr(declaration) {
      return `\`${declaration.split('\n').join(' ').replace(/ =.+$/, '')}\``;
    }

    return {
      VariableDeclaration(node) {
        const declaration = sourceCode.getText(node);

        if (!hasRequire.test(declaration)) return;

        if (previousDeclaration) {
          if (shouldStartNewGroup(node, previousNode)) {
            previousDeclaration = null;
            previousNode = null;
            return;
          }

          if (previousDeclaration.toLowerCase() > declaration.toLowerCase()) {
            context.report({
              loc: node.loc,
              message: `${repr(declaration)} should come before ` +
                       `${repr(previousDeclaration)}`,
              fix: fixer => {
                const replacement = [
                  declaration,
                  previousDeclaration,
                ].join('\n');
                return fixer.replaceTextRange(
                  [previousNode.start, node.end],
                  replacement
                );
              },
            });
          }
        }

        previousDeclaration = declaration;
        previousNode = node;
      },
    };
  },
};
