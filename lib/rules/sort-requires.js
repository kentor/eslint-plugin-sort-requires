'use strict';

const errorMessage = `
  Variables within a declaration group should be sorted alphabetically.
`.trim();

module.exports = {
  meta: {},
  create(context) {
    const hasRequire = /require\(/;
    const sourceCode = context.getSourceCode();
    let previousDeclaration;
    let previousFilename;
    let previousNode;

    function shouldStartNewGroup(node, previousNode) {
      const lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      const lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    return {
      VariableDeclaration(node) {
        const declaration = sourceCode.getText(node).toLowerCase();

        if (!hasRequire.test(declaration)) return;

        if (previousDeclaration) {
          if (shouldStartNewGroup(node, previousNode)) {
            previousDeclaration = null;
            previousNode = null;
            return;
          }

          if (previousDeclaration > declaration) {
            context.report({
              message: errorMessage,
              node,
            });
          }
        }

        previousDeclaration = declaration;
        previousNode = node;
      },
    };
  },
  errorMessage,
};
