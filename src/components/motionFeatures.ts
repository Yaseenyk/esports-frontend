import { domAnimation } from "framer-motion";

/** The animation feature set, kept in its own file so MotionProvider can fetch it after the page is up instead of inside the first load. */
export default domAnimation;
