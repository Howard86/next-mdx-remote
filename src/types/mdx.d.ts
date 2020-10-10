declare module '@mdx-js/mdx' {
  export interface MdxOptions {
    mdPlugins?: unknown[]
    rehypePlugins?: unknown[]
    hastPlugins?: unknown[]
    compilers?: unknown[]
    filepath?: string
    skipExport?: boolean
  }

  export default function mdx(
    source: string,
    options: MdxOptions
  ): Promise<string>
}
