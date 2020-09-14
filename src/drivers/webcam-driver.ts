import { Stream } from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";

let video: HTMLVideoElement | undefined;
export const webcamDriver = (sink: Stream<CameraState>) => {
  sink
    .compose(dropRepeats())
    .filter(x => !!x)
    .subscribe({
      next(payload) {
        switch (payload.action) {
          case "ready":
            if (!video && payload.video) {
              video = payload.video;
              readyCamera(payload.video)
                .catch(err => {
                  video = undefined;
                  console.error(err);
                })
                .then(() => {
                  console.log("video ready", video);
                });
            }
            break;
          case "reset":
            console.log("Reset");
            break;
          case "shot":
            console.log("Shot!");
            break;
        }
      }
    });
};

async function readyCamera(video: HTMLVideoElement) {
  if (navigator.mediaDevices.getUserMedia) {
    return await navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log("Something went wrong!");
        console.error(error);
      });
  }
  return Promise.reject("Cannot resolve media device");
}

export type CameraState = {
  action: "ready" | "shot" | "reset";
  video: HTMLVideoElement | undefined;
};
