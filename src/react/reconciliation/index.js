import { createTaskQueue } from '../Misc';

const taskQueue = createTaskQueue();
let subTask = null;

const getFirstTask = () => {};

const executeTask = () => {};

const workLoop = (deadline) => {
  if (!subTask) {
    subTask = getFirstTask();
  }
  while (subTask && deadline.timeRemaining() > 1) {
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
