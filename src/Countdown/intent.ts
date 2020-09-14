import xs from "xstream";
import { MainDOMSource } from "@cycle/dom";
import { Start, Stop } from "./model";

export function intent(DOM: MainDOMSource) {
  const startAction$ = DOM.select(".start")
    .events("click")
    .mapTo(new Start());
  const stopAction$ = DOM.select(".stop")
    .events("click")
    .mapTo(new Stop());
  const action$ = xs.merge(startAction$, stopAction$);
  return action$;
}

