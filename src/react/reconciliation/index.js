import { arrified, createStateNode, createTaskQueue, getTag } from '../Misc';

const taskQueue = createTaskQueue();
let subTask = null;

const getFirstTask = () => {
  const task = taskQueue.pop();
  return {
    props: task.props,
    stateNode: task.dom,
    tag: 'host_root',
    effects: [],
    child: null,
  };
};

const reconcileChildren = (fiber, children) => {
  const arrifiedChildren = arrified(children);
  let prevFiber;
  arrifiedChildren.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      tag: getTag(child),
      effects: [],
      effectTag: 'placement',
      parent: fiber,
    };
    newFiber.stateNode = createStateNode(newFiber);
    if (index === 0) { // 父级fiber添加子级fiber
      fiber.child = newFiber;
    } else { // 为fiber添加下一个兄弟fiber
      prevFiber.sibling = newFiber;
    }
    prevFiber = newFiber;
  });
};

const executeTask = (fiber) => {
  reconcileChildren(fiber, fiber.props.children);
  if (fiber.child) {
    return fiber.child
  }

  // 如果存在同级 返回同级 构建同级的子级
  // 如果同级不存在 返回到父级 看父级是否有子级
  let currentExcutelyFiber = fiber
  while (currentExcutelyFiber.parent) {
    currentExcutelyFiber.parent.effects = currentExcutelyFiber.parent.effects.concat(
      currentExcutelyFiber.effects.concat([currentExcutelyFiber])
    )
    if (currentExcutelyFiber.sibling) {
      return currentExcutelyFiber.sibling
    }
    currentExcutelyFiber = currentExcutelyFiber.parent
  }
};

const workLoop = (deadline) => {
  if (!subTask) {
    subTask = getFirstTask();
  }
  while (subTask) {
    subTask = executeTask(subTask);
  }
};

const performTask = (deadline) => {
  // 执行任务
  workLoop(deadline);
  /**
   * 判断任务存不存在
   * 判断任务队列中是否还有任务没有执行
   * 再一次告诉浏览器在空闲的时间执行任务
   */
  if (subTask || !taskQueue.isEmpty()) {
    requestIdleCallback(performTask);
  }
};

export const render = (element, dom) => {
  /**
   * 1. 向任务队列中添加任务
   * 2. 指定在浏览器空闲时执行任务
   */

  /**
   * 任务就是通过vdom对象构建fiber对象
   */
  // 1. 向任务队列中添加任务
  taskQueue.push({
    dom,
    props: { children: element },
  });
  // 2. 指定在浏览器空闲时执行任务
  requestIdleCallback(performTask);
};
