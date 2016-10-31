const rule = require('../../../lib').rules['sort-requires'];
const { RuleTester } = require('eslint');

const code = (lines) => lines.join('\n');
const ruleTester = new RuleTester();

ruleTester.run('sort-requires', rule, {
  valid: [
    code([
      'var a = require()',
      'var b = require()',
    ]),
    code([
      'var a = require()',
      'var b =',
      '  require()',
      'var c = require()',
    ]),
    code([
      'var a = require()',
      'var A = require()',
    ]),
    code([
      'var A = require()',
      'var a = require()',
    ]),
    code([
      'var a = require()',
      'var c = require()',
      '',
      'var b = require()',
    ]),
    code([
      'var a = require()[0]',
      'var b = require().test',
      'var c = require().test[0]',
    ]),
    {
      code: code([
        'var _ = require()',
        'var a = require()',
        'var A = require()',
        'var b = require()',
        'var B = require()',
        'var { a } = require()',
        'var { b } = require()',
      ]),
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'const a = require()',
        'const b = require()',
      ]),
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'const b = require()',
        'let a = require()',
      ]),
      parserOptions: { ecmaVersion: 6 },
    },
    code([
      'var b = "hi"',
      'var a = "sup"',
    ]),
    code([
      'var a = require()',
      'var c = require()',
      '',
      'var b = require()',
    ]),
  ],

  invalid: [
    {
      code: code([
        'var b = require().default',
        'var a = require()',
      ]),
      output: code([
        'var a = require()',
        'var b = require().default',
      ]),
      errors: [{ message: '`var a` should come before `var b`' }],
    },
    {
      code: code([
        'var b =',
        '  require()',
        'var a = require()',
      ]),
      output: code([
        'var a = require()',
        'var b =',
        '  require()',
      ]),
      errors: [{ message: '`var a` should come before `var b`' }],
    },
    {
      code: code([
        'var b =',
        '',
        '  require()',
        'var a = require()',
      ]),
      errors: [{ message: '`var a` should come before `var b`' }],
    },
    {
      code: code([
        'var { b } = require()',
        'var { a } = require()',
      ]),
      errors: [{ message: '`var { a }` should come before `var { b }`' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'var { c, a } = require()',
        'var { b } = require()',
      ]),
      output: code([
        'var { b } = require()',
        'var { c, a } = require()',
      ]),
      errors: [{ message: '`var { b }` should come before `var { c, a }`' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'var { b } = require()',
        'var a = require()',
      ]),
      errors: [{ message: '`var a` should come before `var { b }`' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'let a = require()',
        'const B = require()',
      ]),
      output: code([
        'const B = require()',
        'let a = require()',
      ]),
      errors: [{ message: '`const B` should come before `let a`' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'const a = require()',
        'let c = require()',
        'let b = require()',
      ]),
      output: code([
        'const a = require()',
        'let b = require()',
        'let c = require()',
      ]),
      errors: [{ message: '`let b` should come before `let c`' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: code([
        'var c = require().test[0]',
        'var b = require().test',
        'var a = require()[0]',
      ]),
      // Note: Should be fixed but the test fixer only fixes it once
      output: code([
        'var c = require().test[0]',
        'var a = require()[0]',
        'var b = require().test',
      ]),
      errors: [
        { message: '`var b` should come before `var c`' },
        { message: '`var a` should come before `var b`' },
      ],
    },
  ],
});
