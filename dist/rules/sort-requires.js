'use strict';

module.exports = {
  meta: {
    fixable: 'code'
  },

  create: function create(context) {
    var hasRequire = /require\(/;
    var sourceCode = context.getSourceCode();
    var previousDeclaration = void 0;
    var previousNode = void 0;

    function shouldStartNewGroup(node, previousNode) {
      var lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      var lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    function repr(declaration) {
      return '`' + declaration.split('\n').join(' ').replace(/ =.+$/, '') + '`';
    }

    return {
      VariableDeclaration: function VariableDeclaration(node) {
        var declaration = sourceCode.getText(node);

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
              message: repr(declaration) + ' should come before ' + ('' + repr(previousDeclaration)),
              fix: function fix(fixer) {
                var replacement = [declaration, previousDeclaration].join('\n');
                return fixer.replaceTextRange([previousNode.start, node.end], replacement);
              }
            });
          }
        }

        previousDeclaration = declaration;
        previousNode = node;
      }
    };
  }
};