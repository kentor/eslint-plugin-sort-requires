'use strict';

var errorMessage = '\n  Variables within a declaration group should be sorted alphabetically.\n'.trim();

module.exports = {
  meta: {},
  create: function create(context) {
    var hasRequire = /require\(/;
    var sourceCode = context.getSourceCode();
    var previousDeclaration = void 0;
    var previousFilename = void 0;
    var previousNode = void 0;

    function shouldStartNewGroup(node, previousNode) {
      var lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      var lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    return {
      VariableDeclaration: function VariableDeclaration(node) {
        var declaration = sourceCode.getText(node).toLowerCase();

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
              node: node
            });
          }
        }

        previousDeclaration = declaration;
        previousNode = node;
      }
    };
  },

  errorMessage: errorMessage
};