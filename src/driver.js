/* @flow */

export type Attributes = {
  [string]: void | null | string | number | boolean
}

export type Style = {
  [string]: null | string | number | boolean
}

export type Properties = {
  attributes?: Attributes,
  style?: Style,
  key?: string,
  value?: mixed,
  [string]: mixed
}

export interface Node {
  renderWith<node: Node>(driver: Driver<node>): node
}

export interface Driver<node: Node> {
  createTextNode(text: string): node,
  createElement(
    tagName: string,
    properties: ?Properties,
    children: ?Array<string | node>
  ): node,
  createElementNS(
    namespaceURI: string,
    tagName: string,
    properties: ?Properties,
    children: ?Array<string | node>
  ): node,
  createThunk<a, b, c, d, e, f, g, h, i, j>(
    key: string,
    view: (
      a0: a,
      a1: b,
      a2: c,
      a3: d,
      a4: e,
      a5: f,
      a6: g,
      a7: h,
      a8: i,
      a9: j
    ) => node,
    args: [a, b, c, d, e, f, g, h, i, j]
  ): node,
  render(tree: node): void
}
