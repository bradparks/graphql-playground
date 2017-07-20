/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Argument from './Argument'
import { isType, GraphQLInterfaceType } from 'graphql'
import MarkdownContent from 'graphiql/dist/components/DocExplorer/MarkdownContent'
import TypeLink from './TypeLink'
import TypeDetails from './TypeDetails'

interface Props {
  schema: any
  field: any
  level: number
  onClickType: (field: any, level: number) => void
}

interface State {
  showDeprecated: boolean
}

export default class FieldDoc extends React.Component<Props, State> {
  state = { showDeprecated: false }

  componentDidMount() {
    const explorer = ReactDOM.findDOMNode(this)
    const explorerDoc: any =
      explorer.parentNode && explorer.parentNode.parentNode
    // TODO see browser compatibility scrollWidth && scrollLeft
    scrollToRight(
      explorerDoc,
      explorerDoc.scrollWidth - explorerDoc.offsetWidth,
      300,
    )
  }

  shouldComponentUpdate(nextProps) {
    return this.props.field !== nextProps.field
  }

  onClickType = type => {
    this.props.onClickType(type, this.props.level)
  }

  render() {
    const { schema, field } = this.props
    const type = field.type || field
    const isVarType = isType(type)

    let argsDef
    if (field.args && field.args.length > 0) {
      argsDef = (
        <div>
          <div className="doc-category-title">arguments</div>
          {field.args.map(arg =>
            <div key={arg.name}>
              <div>
                <Argument arg={arg} onClickType={this.onClickType} />
              </div>
              <MarkdownContent
                className="doc-value-description"
                markdown={arg.description}
              />
            </div>,
          )}
        </div>
      )
    }

    let implementationsDef
    if (isVarType && type instanceof GraphQLInterfaceType) {
      const types = schema.getPossibleTypes(type)
      implementationsDef = (
        <div>
          <div className="doc-category-title">implementations</div>
          {types.map(data =>
            <TypeLink key={data.name} type={data} onClick={this.onClickType} />,
          )}
        </div>
      )
    }

    return (
      <div>
        <style jsx={true}>{`
          .doc-header {
            @p: .bgBlack02, .pb10, .pt20;
          }
          .doc-type-description {
            @p: .pb16;
          }
          .doc-deprecation {
            @p: .ph16, .black50;
          }
        `}</style>
        <div className="doc-header">
          <TypeLink type={field} />
        </div>
        {!isVarType &&
          <MarkdownContent
            className="doc-type-description"
            markdown={field.description || 'No Description'}
          />}
        <TypeDetails
          type={type}
          schema={schema}
          onClickType={this.onClickType}
        />
        {argsDef}
        {implementationsDef}
      </div>
    )
  }

  private handleShowDeprecated = () => this.setState({ showDeprecated: true })
}

const scrollToRight = (element: Element, to: number, duration: number) => {
  if (duration <= 0) {
    return
  }
  const difference = to - element.scrollLeft
  const perTick = difference / duration * 10
  setTimeout(() => {
    element.scrollLeft = element.scrollLeft + perTick
    if (element.scrollLeft === to) {
      return
    }
    scrollToRight(element, to, duration - 10)
  }, 10)
}
