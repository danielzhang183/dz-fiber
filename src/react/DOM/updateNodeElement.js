export default function updateNodeElement(newElement, virtualDOM, oldVirtualDOM = {}) {
  const newProps = virtualDOM.props || {};
  const oldProps = oldVirtualDOM.props || {};
  Object.keys(newProps).forEach((propName) => {
    const newPropsValue = newProps[propName];
    const oldPropsValue = oldProps[propName];
    if (newPropsValue !== oldPropsValue) {
      if (/^on/.test(propName)) {
        const eventName = propName.toLocaleLowerCase().slice(2);
        newElement.addEventListener(eventName, newPropsValue);
        oldPropsValue && newElement.removeEventListener(eventName, oldPropsValue);
      } else if (propName === 'value' || propName === 'checked') {
        newElement[propName] = newPropsValue;
      } else if (propName !== 'children') {
        if (propName === 'className') {
          newElement.setAttribute('class', newPropsValue);
        } else {
          newElement.setAttribute(propName, newPropsValue);
        }
      }
    }
  });

  Object.keys(oldProps).forEach((propName) => {
    const newPropsValue = newProps[propName];
    const oldPropsValue = oldProps[propName];
    if (!newPropsValue) {
      if (/^on/.test(propName)) {
        const eventName = propName.toLocaleLowerCase().slice(2);
        newElement.removeEventListener(eventName, oldPropsValue);
      } else if (propName !== 'children') {
        if (propName === 'value') {
          newElement.value = '';
        } else {
          newElement.removeAttribute(propName);
        }
      }
    }
  });
}
