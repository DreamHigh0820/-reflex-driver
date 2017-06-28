/* @flow */

export const ELEMENT_NODE = 1
export const TEXT_NODE = 3
export const DOCUMENT_FRAGMENT_NODE = 11

export type Attributes = {
  [string]: null | string | number | boolean
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

export interface TextNode {
  nodeType: typeof TEXT_NODE,
  text: string
}

export interface ElementNode {
  nodeType: typeof ELEMENT_NODE,
  namespaceURI: ?string,
  tagName: string,
  key: ?string,
  children: Array<Node>
}

export interface ThunkNode {
  $type: "Thunk",
  key: string
}

export interface WidgetNode {
  $type: "Widget",
  initialize(): Element,
  update(previous: WidgetNode, target: Element): ?Element,
  destroy(node: Element): void
}

export type Node = string | TextNode | ElementNode | ThunkNode | WidgetNode

// Root node is a lazy (uncomputed & unrendered) representation of the
// application view that can be rendered with reflex renderer by calling
// `renderWith` method.
export interface DocumentFragmentNode {
  nodeType: typeof DOCUMENT_FRAGMENT_NODE,
  renderWith(driver: Driver): Node
}

export type CreateTextNode = (content: string) => Text

export type CreateElement = (
  tagName: string,
  properties: ?Properties,
  children: ?Array<Node>
) => ElementNode

export type CreateElementNS = (
  namespaceURI: string,
  tagName: string,
  properties: ?Properties,
  children: ?Array<Node>
) => ElementNode

export type CreateThunkNode = <a, b, c, d, e, f, g, h, i, j>(
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
  ) => Node,
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
) => ThunkNode

export interface Driver {
  createTextNode: CreateTextNode,
  createElement: CreateElement,
  createElementNS: CreateElementNS,
  createThunkNode: CreateThunkNode,
  render(node: ThunkNode): void
}
