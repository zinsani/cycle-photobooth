import { div, span, button, h1, p } from "@cycle/dom";
import { CountdownState } from ".";
import { Stream } from "xstream";

export function view(state: Stream<CountdownState>) {
  return state.map(({ isRunning, count, timeover, cancelable }) => {
    const titleText = h1("countdown");
    const countdownText = !isRunning
      ? timeover
        ? span("Shot!")
        : span("Press button to start countdown")
      : span(count);
    const btn = isRunning
      ? button(
          ".stop",
          { attrs: cancelable ? undefined : { disabled: true } },
          "Stop"
        )
      : button(".start", timeover ? "Retry" : "Start");

    return div(".countdown-container", [titleText, p([countdownText]), btn]);
  });
}
