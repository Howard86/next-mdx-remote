import React, { ReactElement } from 'react'
import mdx, { MdxOptions } from '@mdx-js/mdx'
import { MDXProvider, mdx as mdxReact, MDXProviderProps } from '@mdx-js/react'
import { transformAsync, TransformOptions } from '@babel/core'
import presetEnv from '@babel/preset-env'
import presetReact from '@babel/preset-react'
import { renderToString as reactRenderToString } from 'react-dom/server'

import { BabelPluginMdxBrowser } from './babel-plugin-mdx-browser'

export interface Scope {
  [key: string]: unknown
}

export interface Source {
  compiledSource: string
  renderedOutput: string
  scope?: Scope
}

type RenderToStringOptions = {
  components?: MDXProviderProps['components']
  mdxOptions?: MdxOptions
  scope?: Scope
}

export async function renderToString(
  source: string,
  { components, mdxOptions, scope = {} }: RenderToStringOptions = {}
): Promise<Source> {
  // transform it into react
  const code = await mdx(source, { ...mdxOptions, skipExport: true })
  // mdx gives us back es6 code, we then need to transform into two formats:
  // - first a version we can render to string right now as a "serialized" result
  // - next a version that is fully browser-compatible that we can eval to rehydrate

  const [now, later] = await Promise.all([
    // this one is for immediate evaluation so we can renderToString below
    transformAsync(code, {
      presets: [presetReact, presetEnv],
      configFile: false,
    }),
    // this one is for the browser to eval and rehydrate, later
    // evaluate the code
    transformAsync(code, {
      presets: [presetReact, presetEnv],
      configFile: false,
      plugins: [BabelPluginMdxBrowser],
    }),
  ])

  if (!now || !later || !later.code) {
    throw new Error('Failed to transform mdx source code')
  }

  // NOTES:
  // - relative imports can't be expected to work with remote files, we'd need
  //   an extra babel transform to be able to import specific file paths
  const component: ReactElement = new Function(
    'React',
    'MDXProvider',
    'mdx',
    'components',
    ...Object.keys(scope),
    `${now.code}
    return React.createElement(MDXProvider, { components },
      React.createElement(MDXContent, {})
    );`
  )(React, MDXProvider, mdxReact, components, ...Object.values(scope))

  return {
    compiledSource: later.code,
    // react: render to string
    renderedOutput: reactRenderToString(component),
    scope,
  }
}
