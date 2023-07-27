import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

const ControlPanel = () => {
  return <div className={cx("container")}></div>;
};

export default ControlPanel;
