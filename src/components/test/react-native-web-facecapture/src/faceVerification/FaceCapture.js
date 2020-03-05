import { Buffer } from "buffer/";
import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import _throttle from "lodash/throttle";
import Camera from "./Camera";
import CameraOverlay from "./CameraOverlay";

import {
  isValidFace as isValidFaceDefault,
  isQualityImage as isQualityImageDefault,
  cropToFace
} from "./faceQuality";

global.Buffer = Buffer;
let takingPicture = false;
const FaceCapture = ({
  isValidFace = isValidFaceDefault,
  isQualityImage = isQualityImageDefault,
  onFaces,
  onError,
  cameraContainerStyle = {},
  containerStyle = {},
  cameraProps = {},
  overlayProps,
  pictureOptions = {}
}) => {
  let camera;
  pictureOptions = {
    ...{
      width: 640,
      orientation: "portrait",
      quality: 0.9,
      base64: true,
      doNotSave: true,
      forceOrientation: true,
      fixOrientation: true,
      exif: true
    },
    ...pictureOptions
  };
  let [face, setFace] = useState();
  let [message, setMessage] = useState();
  let [valid, setValid] = useState(false);
  let [brightness, setBrightness] = useState({ ok: true });
  let [captured, setCaptured] = useState([]);
  let [sample, setSample] = useState();

  const onFacesProxy = async (faces, viewport, camera) => {
    // console.log({ faces }, faces.faces[0])
    try {
      //stop once we have a valid face
      if (valid) return;
      if (!faces || !faces.faces) return;
      if (faces.faces.length === 1) {
        let imageResult;
        let tookPicture = false;
        setFace(faces.faces[0]);
        if (takingPicture === false) {
          imageResult = takePicture(camera, faces.faces[0], viewport);
          tookPicture = true;
        }
        //if badlighting status is on then dont continue unless new image is ok
        if (brightness.ok === false) {
          setMessage("Too Dark " + brightness.brightness);
          const isGoodLighting = await imageResult;
          console.log({ isGoodLighting });
          if (isGoodLighting !== true) return;
          setMessage(undefined);
        }
        const facesResult = faces.faces.map(_ => {
          const res = isValidFace(viewport, _);
          return { ..._, ...res };
        });
        const validFaces = facesResult.filter(_ => _.ok);
        if (validFaces.length === 1) {
          setMessage(undefined);
          setValid(true);
          //take last shot
          if (tookPicture === false)
            await takePicture(camera, faces.faces[0], viewport);
          onFaces(validFaces, camera, captured);
        } else {
          console.log(facesResult[0]);
          setMessage(facesResult[0].error);
        }
      } else if (faces.faces.length > 1) {
        setMessage("More Than One Face Detected");
      } else {
        setMessage("No faces detected");
      }
    } catch (e) {
      console.log("Exception in onFacesProxy", { e });
      onError && onError({ error: "onFacesProxy failed", exception: e });
    }
  };

  const handler = useCallback(_throttle(onFacesProxy, 200), [
    valid,
    brightness,
    captured
  ]);

  const renderFace = ({ bounds, faceID, rollAngle, yawAngle }) => {
    console.log("Rendering", { bounds });
    return (
      <View
        key={faceID}
        transform={[
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` }
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y
          }
        ]}
      >
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    );
  };

  const takePicture = async (camera, face, viewport) => {
    if (camera) {
      try {
        takingPicture = true;
        const data = await camera.takePictureAsync(pictureOptions);
        takingPicture = false;
        const faceBase64 = await cropToFace(data, face, viewport);
        setSample(faceBase64);
        const isValid = isQualityImage(faceBase64);
        setBrightness(isValid);
        captured = captured.slice(0, 5);
        captured.unshift(data);
        setCaptured(captured);

        console.log(
          Object.keys(data),
          captured.length,
          data.exif,
          data.deviceOrientation,
          data.pictureOrientation
        );
        return isValid.ok;
      } catch (e) {
        console.log("Error capturing face:", e);
        onError && onError({ error: "takePicture failed", exception: e });
      }
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.cameraContainer, cameraContainerStyle]}>
        <Camera onError={onError} onFaces={handler} cameraProps={cameraProps} />
      </View>
      <CameraOverlay
        color={valid ? "rgba(0,250,50,0.5)" : "rgba(0,0,0,0.5)"}
        {...overlayProps}
      />
      <View style={styles.facesContainer}>
        <Text style={styles.feedBack}>{message}</Text>
        {process.env.NODE_ENV === "development" && (
          <Text style={styles.feedBack}>{brightness.brightness}</Text>
        )}
      </View>
      {process.env.NODE_ENV === "development" && face && (
        <View style={styles.facesContainer}>{renderFace(face)}</View>
      )}
      {process.env.NODE_ENV === "development" && sample && (
        <Image
          source={{
            isStatic: true,
            uri: "data:image/jpeg;base64," + sample
          }}
          resizeMethod="auto"
          resizeMode="center"
          style={{
            position: "absolute",
            top: 400,
            height: "50%",
            width: "50%"
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center"
  },
  cameraContainer: {
    backgroundColor: "blue",
    borderColor: "orange",
    width: "100%",
    height: "100%",
    alignSelf: "center"
  },
  facesContainer: {
    position: "absolute",
    flex: 1,
    bottom: 0,
    right: 0,
    left: 0,
    top: 0
  },
  feedBack: {
    lineHeight: 40,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "blue",
    alignSelf: "center"
  },
  face: {
    padding: 10,
    borderWidth: 5,
    borderRadius: 2,
    position: "absolute",
    borderColor: "#FFD700",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  }
});

export default FaceCapture;
