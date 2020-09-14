import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import dropRepeats from "xstream/extra/dropRepeats";
import { CountdownState } from ".";

export class Start {}
export class Stop {}

export const initialCountdownState: CountdownState = {
  maxCount: 5,
  minCountToCancel: 2,
  resetSeconds: 3,
  count: 0,
  isRunning: false,
  timeover: false,
  cancelable: true
};

export function model(action$: Stream<any>, state: Stream<CountdownState>) {
  const timeover$: Stream<boolean> = xs.create();

  const isRunning$ = xs.merge(
    action$.filter(action => action instanceof Start).mapTo(true),
    action$.filter(action => action instanceof Stop).mapTo(false),
    timeover$.filter(x => x).mapTo(false)
  );

  const count$ =
    // xs.combine(state, isRunning$)
    isRunning$
      .compose(sampleCombine(state))
      .map(([isRunning, { maxCount }]) => {
        if (isRunning)
          return xs
            .periodic(1000)
            .fold(x => x - 1, maxCount)
            .startWith(maxCount);

        return xs.never();
      })
      .flatten();

  const timeoverAndReset$ = timeover$
    .filter(x => x)
    .compose(sampleCombine(state))
    .map(([, { resetSeconds }]) =>
      xs
        .periodic(resetSeconds * 1000)
        .take(1)
        .mapTo(false)
    )
    .flatten();

  const cancelable$ = count$
    .compose(sampleCombine(state))
    .map(([count, { minCountToCancel }]) => count > minCountToCancel)
    .compose(dropRepeats());

  timeover$.imitate(
    xs
      .merge(
        count$.map(x => x === 0),
        timeoverAndReset$
      )
      .compose(dropRepeats())
  );

  const countReducer$ = count$.map(count => (prev: CountdownState) =>
    ({
      ...prev,
      count
    } as CountdownState)
  );

  const isRunningReducer$ = isRunning$.map(
    isRunning => (prev: CountdownState) =>
      ({ ...prev, isRunning } as CountdownState)
  );

  const timeoverReducer$ = timeover$.map(timeover => (prev: CountdownState) =>
    ({ ...prev, timeover } as CountdownState)
  );

  const cancelableReducer$ = cancelable$.map(
    cancelable => (prev: CountdownState) =>
      ({ ...prev, cancelable } as CountdownState)
  );

  const initialReducer$ = xs.of((prev: CountdownState) =>
    prev === undefined ? initialCountdownState : prev
  );

  const reducers$ = xs.merge(
    initialReducer$,
    countReducer$,
    timeoverReducer$,
    isRunningReducer$,
    cancelableReducer$
  );

  return reducers$;
}
