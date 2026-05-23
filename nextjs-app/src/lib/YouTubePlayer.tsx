"use client";

import ReactPlayer from "react-player";

export default function YouTubePlayer({ url }: { url: string }) {
  return (
    <ReactPlayer
      src={url}
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
