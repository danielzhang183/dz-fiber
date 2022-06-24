export default function createElement(type, props, ...children) {
  const childrenElements = [].concat(...children).reduce((result, child) => {
    if (child !== true && child !== false && child !== null) {
      if (child instanceof Object) {
        result.push(child)
      } else {
        result.push(createElement('text', { textContent: child }))
      }
    }
    return result
  }, [])
  return {
    type,
    props: Object.assign({ children: childrenElements }, props),
  }
}
