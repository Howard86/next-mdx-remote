import { NodePath } from '@babel/core'
import { ImportDeclaration } from '@babel/types'

import type {
  Expression,
  LVal,
  VariableDeclaration,
  VariableDeclarator,
} from '@babel/types'

interface CustomVariableDeclaration extends VariableDeclaration {
  declarations: Array<CustomVariableDeclarator>
}

interface CustomVariableDeclarator extends VariableDeclarator {
  id: CustomLVal
  init: CustomExpression
}

type CustomLVal = LVal & { name: string }
type CustomExpression = (Expression | null) & { callee: CustomLVal }

export function BabelPluginMdxBrowser() {
  return {
    visitor: {
      // remove all imports, we will add these to scope manually
      ImportDeclaration(path: NodePath<ImportDeclaration>) {
        path.remove()
      },
      // the `makeShortcode` template is nice for error handling but we
      // don't need it here as we are manually injecting dependencies
      VariableDeclaration(path: NodePath<CustomVariableDeclaration>) {
        // this removes the `makeShortcode` function
        if (path.node.declarations[0].id.name === 'makeShortcode') {
          path.remove()
        }

        // this removes any variable that is set using the `makeShortcode` function
        if (path.node.declarations[0]?.init?.callee?.name === 'makeShortcode') {
          path.remove()
        }
      },
    },
  }
}
