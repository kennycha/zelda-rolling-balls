import Canvas from "./Canvas";
// import ControlPanel from "./ControlPanel";
// import Footer from "./Footer";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

const App = () => {
  return (
    <div className={cx("container")}>
      {/* <ControlPanel /> */}
      <Canvas />
      {/* <Footer /> */}
    </div>
  );
};

export default App;
