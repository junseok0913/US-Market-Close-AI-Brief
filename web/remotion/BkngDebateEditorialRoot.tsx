import React from "react";
import {Composition} from "remotion";
import {z} from "zod";
import demoProps from "./demo/bkng-debate-20260317-editorial.props.json";
import {
  BkngDebateEditorialProps,
  BkngDebateEditorialSchema,
  BkngDebateEditorialShort,
} from "./BkngDebateEditorialShort";

const defaultProps = BkngDebateEditorialSchema.parse(
  demoProps,
) satisfies BkngDebateEditorialProps;

const calculateMetadata = async ({
  props,
}: {
  props: z.infer<typeof BkngDebateEditorialSchema>;
}) => {
  const durationSeconds = Math.max(1, props.durationSeconds || 60);
  return {
    durationInFrames: Math.round(durationSeconds * 30),
    props,
  };
};

export const BkngDebateEditorialRoot: React.FC = () => {
  return (
    <Composition
      id="BkngDebateEditorialShort"
      component={BkngDebateEditorialShort}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1800}
      schema={BkngDebateEditorialSchema}
      defaultProps={defaultProps}
      calculateMetadata={calculateMetadata}
    />
  );
};
