import { updateNodeElement } from '../DOM';
import { arrified, createStateNode, createTaskQueue, getTag } from '../Misc';

const [
  HOST_ROOT,
  HOST_COMPONENT,
  CLASS_COMPONENT,
  FUNCTION_COMPONENT,
] = [
    'host_root',
    'host_component',
    'class_component',
    'function_component',
  ]
const [
  DELETE,
  UPDATE,
  PLACEMENT,
] = [
    'delete',
    'update',
    'placement',
  ]
const FIBER_TAG = {
  HOST_ROOT,
  HOST_COMPONENT,
  CLASS_COMPONENT,
  FUNCTION_COMPONENT,
}
const EFFECT_TAG = {
  DELETE,
  UPDATE,
  PLACEMENT,
}
const taskQueue = createTaskQueue();
let subTask = null;
let pendingCommit = null

const commitAllWork = (fiber) => {
  // 根据effects数组 构建DOM节点树
  fiber.effects.forEach((item) => {
    switch (item.effectTag) {
      case EFFECT_TAG.DELETE:
        item.parent.stateNode.removeChild(item.stateNode)
        break;
      case EFFECT_TAG.UPDATE:
        item.type === item.alternate.type
          ? updateNodeElement(item.stateNode, item, item.alternate)
          : item.parent.stateNode.replaceChild(item.stateNode, item.alternate.stateNode)
        break;
      case EFFECT_TAG.PLACEMENT:
        const fiber = item
        let parentFiber = item.parent
        while ([FIBER_TAG.CLASS_COMPONENT, FIBER_TAG.FUNCTION_COMPONENT].includes(parentFiber.tag)) {
          parentFiber = parentFiber.parent
        }
        if (fiber.tag === FIBER_TAG.HOST_COMPONENT) {
          parentFiber.stateNode.appendChild(fiber.stateNode)
        }
        break;
      default:
    }
  })
  // 备份旧的fiber对象
  fiber.stateNode.__rootFiberContainer = fiber
}

const getFirstTask = () => {
  const task = taskQueue.pop();
  return {
    props: task.props,
    stateNode: task.dom,
    tag: FIBER_TAG.HOST_ROOT,
    effects: [],
    child: null,
    alternate: task.dom.__rootFiberContainer,
  };
};

const reconcileChildren = (fiber, children) => {
  const arrifiedChildren = arrified(children);
  let newFiber;
  let prevFiber;
  let alternate;
  alternate = fiber.alternate?.child || null
  arrifiedChildren.forEach((child, index) => {
    const baseFiber = {
      type: child.type,
      props: child.props,
      tag: getTag(child),
      effects: [],
      parent: fiber,
    }
    if (!child && alternate) {
      alternate.effectTag = EFFECT_TAG.DELETE
      fiber.effects.push(alternate)
    } if (child && alternate) {
      newFiber = {
        ...baseFiber,
        effectTag: EFFECT_TAG.UPDATE,
        alternate
      };
      if (child.type === alternate.type) {
        newFiber.stateNode = alternate.stateNode
      } else {
        newFiber.stateNode = createStateNode(newFiber);
      }
    } else if (child && !alternate) {
      newFiber = {
        ...baseFiber,
        effectTag: EFFECT_TAG.PLACEMENT,
      };
      newFiber.stateNode = createStateNode(newFiber);
    }
    if (index === 0) { // 父级fiber添加子级fiber
      fiber.child = newFiber;
    } else if (child) { // 为fiber添加下一个兄弟fiber
      prevFiber.sibling = newFiber;
    }
    alternate = alternate?.sibling || null
    prevFiber = newFiber;
  });
};

const executeTask = (fiber) => {
  switch (fiber.tag) {
    case FIBER_TAG.CLASS_COMPONENT:
      reconcileChildren(fiber, fiber.stateNode.render())
      break;
    case FIBER_TAG.FUNCTION_COMPONENT:
      reconcileChildren(fiber, fiber.stateNode(fiber.props))
      break;
    default:
      reconcileChildren(fiber, fiber.props.children);
  }
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
  pendingCommit = currentExcutelyFiber
};

const workLoop = (deadline) => {
  if (!subTask) {
    subTask = getFirstTask();
  }
  while (subTask) {
    subTask = executeTask(subTask);
  }
  if (pendingCommit) {
    commitAllWork(pendingCommit)
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
