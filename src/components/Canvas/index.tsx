import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

const Canvas = () => {
  return <canvas id="renderingCanvas" className={cx("container")}></canvas>;
};

export default Canvas;
