import { StateSource } from "@cycle/state";
import { MainDOMSource } from "@cycle/dom";
import { intent } from "./intent";
import { model } from "./model";
import { view } from "./view";

export function Countdown(sources: {
  DOM: MainDOMSource;
  state: StateSource<CountdownState>;
}) {
  const { DOM } = sources;
  const state = sources.state;

  const action$ = intent(DOM);

  const state$ = model(action$, state.stream);

  const sink = {
    state: state$,
    DOM: view(state.stream)
  };

  return sink;
}

export type CountdownState = {
  maxCount: number;
  minCountToCancel: number;
  resetSeconds: number;
  isRunning: boolean;
  count: number;
  timeover: boolean;
  cancelable: boolean;
};
