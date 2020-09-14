import { div, video, MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";
import xs from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";
import delay from "xstream/extra/delay";
import { CameraState } from "./drivers/webcam-driver";

export function Camera(sources: {
  DOM: MainDOMSource;
  state: StateSource<CameraState & { timeover: boolean }>;
}) {
  const state = sources.state.stream;

  const action$ = state
    .map(({ timeover }) => (timeover ? "shot" : "reset"))
    .compose(dropRepeats());

  const reducer$ = action$.map(action => (prev: CameraState) =>
    ({ ...prev, action } as CameraState)
  );

  const initialReducer$ = sources.DOM.select("#cam")
    .element()
    .map(el => (prev?: CameraState) => ({
      action: "ready",
      video: el as HTMLVideoElement
    }));

  return {
    state: xs.merge(initialReducer$, reducer$),
    DOM: xs.of(div(video("#cam", { attrs: { autoplay: true } })))
  };
}
