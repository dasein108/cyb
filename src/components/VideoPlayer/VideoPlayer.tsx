/* eslint-disable no-restricted-syntax */
import React, { useRef, useEffect } from 'react';
import { IPFSContent } from 'src/utils/ipfs/ipfs';
import { Readable } from 'readable-stream';
import VideoStream from 'videostream';
import { useIpfs } from 'src/contexts/ipfs';
import { catIPFSContentFromNode } from 'src/utils/ipfs/utils-ipfs';

interface VideoPlayerProps {
  content: IPFSContent;
}

function VideoPlayer({ content }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<Readable<Uint8Array> | undefined>(undefined);
  const shouldCatFromNodeRef = useRef<boolean>(false);
  const { node } = useIpfs();

  const getReadableStream = (offset: number) => {
    if (shouldCatFromNodeRef.current) {
      if (streamRef.current && streamRef.current.destroy) {
        streamRef.current.destroy();
      }
      streamRef.current = Readable.from(
        catIPFSContentFromNode(node, content.cid, offset) // TODO: add abortController
      );
    } else {
      streamRef.current = Readable.from(content.result);
    }
    // setShouldCatFromNode(true);
    shouldCatFromNodeRef.current = true;

    return streamRef.current;
  };

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    if (content.source === 'node') {
      const opts = new VideoStream(
        {
          createReadStream: function createReadStream(opts) {
            const { start = 0, end } = opts;
            // The videostream library does not always pass an end byte but when
            // it does, it wants bytes between start & end inclusive.
            // catReadableStream returns the bytes exclusive so increment the end
            // byte if it's been requested
            // const end = opts.end ? start + opts.end + 1 : undefined;

            console.log(
              `Stream: Asked for data starting at byte ${start} and ending at byte ${end}`
            );

            // // Log error messages
            const stream = getReadableStream(start);
            stream.on('error', (error) => {
              console.log('----VideoStream error', error);
            });

            if (start === 0) {
              // Show the user some messages while we wait for the data stream to start
              // console.log('----Start');
            }

            return stream;
          },
        },
        videoRef.current
      );
      console.log('---opts', opts);
    } else if (content.source === 'gateway') {
      videoRef.current.src = content.contentUrl;
    } else {
      console.log('Unknown source, TODO: implement DB', content.source);
    }

    videoRef.current?.addEventListener('error', () =>
      console.log(videoRef.current?.detailedError)
    );
  }, [node]);

  return <video ref={videoRef} controls />;
}

export default VideoPlayer;
