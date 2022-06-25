import React, { render, Component } from './react'

const root = document.getElementById('root')

const jsx = (
  <div>
    <p>Hello React</p>
    <p>Hello Fiber</p>
  </div>
)
render(jsx, root)
const newJsx = (
  <div>
    <div>Hello Dylan</div>
    <p>Hello Fiber</p>
  </div>
)
setTimeout(() => render(newJsx, root), 2000)

class Greating extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div>{this.props.title}Dylan Zhang</div>
  }
}
// render(<Greating title="Hello" />, root)

function FuncComponent(props) {
  return <div>{props.title}Func Component</div>
}
// render(<FuncComponent title="Hello" />, root)