const getTag = (vdom) => {
  if (typeof vdom.type === 'string') {
    return 'host_component';
  }
  return '';
};

export default getTag;
