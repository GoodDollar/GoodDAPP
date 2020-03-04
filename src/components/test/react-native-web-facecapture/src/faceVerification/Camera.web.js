import React from "react";
import { StyleSheet, View } from "react-native";
import {
  isValidFace as isValidFaceDefault,
  isQualityImage as isQualityImageDefault
} from "./faceQuality";

const Camera = ({
  isValidFace = undefined,
  onValidFaces,
  cameraProps = {}
}) => {
  let camera;
  const onFaces = faces => {
    // console.log({ faces }, faces.faces[0])
    if (faces) {
      const validFaces = faces.filter(isValidFace || isValidFaceDefault);
      if (validFaces.length > 0) {
        onValidFaces(validFaces, camera);
      }
    }
  };
  setTimeout(() => onFaces([{ x: 1, y: 1 }]), 2000);
  return (
    <View
      style={{ width: "50%", height: "50%" }}
      ref={ref => {
        camera = ref;
      }}
      onFacesDetected={onFaces}
      {...cameraProps}
    />
  );
};

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  }
});

export default Camera;
