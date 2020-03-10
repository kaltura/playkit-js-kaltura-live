import { h, Component } from "preact";
import * as styles from "./live-tag.scss";

export interface props {}

export class LiveTag extends Component<props> {
    render(props: props) {
        return <div className={[styles.liveTag, styles.offline].join(" ")}>offline</div>;
    }
}
