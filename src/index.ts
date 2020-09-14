import xs, { Stream } from "xstream";
import { run } from "@cycle/run";
import { makeDOMDriver, MainDOMSource, div, h1 } from "@cycle/dom";
import { withState, StateSource } from "@cycle/state";
import isolate from "@cycle/isolate";
import { Countdown, CountdownState } from "./Countdown";
import { Camera } from "./Camera";
import dropRepeats from "xstream/extra/dropRepeats";
import { webcamDriver, CameraState } from "./drivers/webcam-driver";

function main(sources: { DOM: MainDOMSource; state: StateSource<State> }) {
  const countdownSink = isolate(Countdown, "countdown")(sources);

  const cameraScope = {
    state: {
      get: (state: State) => ({
        ...state.camera,
        timeover: state.countdown.timeover
      }),
      set: (state: State, camera: CameraState) =>
        ({
          ...state,
          camera
        } as State)
    }
  };
  const cameraSink = isolate(Camera, cameraScope)(sources);

  const vdom$ = xs
    .combine(countdownSink.DOM, cameraSink.DOM)
    .map(children =>
      div(".container", [
        h1("Cyclejs withState, isolated components"),
        ...children
      ])
    );

  const sink = {
    DOM: vdom$,
    state: xs.merge(countdownSink.state, cameraSink.state),
    camera: sources.state.stream.map(({ camera }) => camera)
  };
  return sink;
}

const drivers = {
  camera: webcamDriver,
  DOM: makeDOMDriver("#app")
};

run(withState(main as any), drivers);

export type State = {
  countdown: CountdownState;
  camera: CameraState;
};
