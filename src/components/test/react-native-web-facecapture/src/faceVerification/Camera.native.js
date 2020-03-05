import React, { useState } from "react";
import { RNCamera } from "react-native-camera";
import { StyleSheet } from "react-native";

const Camera = ({ onFaces, onError, cameraProps = {} }) => {
  let camera;
  let [face, setFace] = useState();
  let [viewport, setViewport] = useState();

  const onFacesProxy = faces => onFaces(faces, viewport, camera);
  return (
    <RNCamera
      onFaceDetectionError={onError}
      onMountError={onError}
      onLayout={e => setViewport(e.nativeEvent.layout)}
      ref={ref => {
        camera = ref;
      }}
      androidRecordAudioPermissionOptions={{
        title: "Permission to use audio recording",

        message: "We need your permission to use your audio",

        buttonPositive: "Ok",

        buttonNegative: "Cancel"
      }}
      style={styles.preview}
      type={RNCamera.Constants.Type.front}
      flashMode={RNCamera.Constants.FlashMode.off}
      androidCameraPermissionOptions={{
        title: "Permission to use camera",
        message: "We need your permission to use your camera",
        buttonPositive: "Ok",
        buttonNegative: "Cancel"
      }}
      faceDetectionClassifications={
        RNCamera.Constants.FaceDetection.Classifications.all
      }
      faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
      faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
      captureAudio={false}
      onFacesDetected={onFacesProxy}
      {...cameraProps}
    />
  );
};

const styles = StyleSheet.create({
  preview: {
    flex: 1
  }
});

export default Camera;
