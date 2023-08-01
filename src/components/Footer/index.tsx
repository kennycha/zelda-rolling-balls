import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

const Footer = () => {
  return (
    <footer className={cx("container")}>
      <p>&copy; kennycha</p>
      <p>|</p>
      <a href="https://github.com/kennycha/zelda-rolling-balls" target="_blank">
        <p>Github</p>
      </a>
    </footer>
  );
};

export default Footer;
