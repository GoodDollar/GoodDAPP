---
description: >-
  Describes the Face Recognition process as part of GoodDollar identification
  process
---

# Face Recognition

## High level description

## High level description

Face Recognition is the process when the user becomes a GoodDollar citizen \(`this.props.store.get('isLoggedInCitizen')`\), and without being a citizen, the user cannot _claim GoodDollars_ or _send existing GoodDollars_ using his/hers wallet. Therefore, Face Recognition process is triggered when, assuming the user have not passed face recognition yet:

* The first time the user tries to claim for GoodDollars
* The first time the user tries to send GoodDollars

The Face Recognition process includes the following steps: 1. Capture - the user video stream is recorded and captured on the client side, using a guided wizard which tells the user how to create the capture. See LLD below for technical details.

1. If succeed, the capture \(also called ZoomCaptureResult\) is sent to the GoodServer server.
2. On the server, the zoom capture is sent to _/verify/facerecognition_ route which:
3. Calls to Zoom _liveness_ test, which check if the user passed liveness test indicators by Zoom. If passed:
4. Calls to Zoom _search_ action, which returns similar users to the user, and server checks if the capture already exists for a GoodDollar citizen already. if not \(no duplicates found for the user\):
5. The user is whitelisted on the server and becomes a citizen.
6. _/verify/facerecognition_ result is returned to the client, and the client shows error message, or continue the desired action \(claim / send\) if the user was whitelisted successfully.

## Low level technical description

The Face Recognition files are located under: [https://github.com/GoodDollar/GoodDAPP/tree/master/src/components/dashboard/FaceRecognition](https://github.com/GoodDollar/GoodDAPP/tree/master/src/components/dashboard/FaceRecognition)

### Dashboard Integration

FaceRecognition is a component that is part of the stackNavigation of the dashbaord:

```text
import FaceRecognition from './FaceRecognition/FaceRecognition'
.
.
export default createStackNavigator({
  .
  .
  FaceRecognition,
  .
  .

})
```

### FaceRecognition.js.web

This is the main FaceRecognition container which is loaded into the dashboard.

{% hint style="info" %}
Please note, Currently, it is not supported as a react native component out of the box and will have to be translated into proper native components \(The  tag is web only\)
{% endhint %}

The component holds the  component and uses the Camera capture result to send it to the server:

```text
onCameraLoad = async (track: MediaStreamTrack) => {
      ..
      captureOutcome = await capture(track) 
      ..
      await this.performFaceRecognition(captureOutcome)
}
```

FaceRecognition request is prepared using the capture result. The capture result made by Zoom API contains the following relevant fields:

* facemap - a zip file contains user facemap data in zoomformat
* auditTrailImage - a jpg file contains user single image data in zoomformat
* sessionId - identifier for this zoom session
* enrollmentIdentifier - an identifier GoodDollar choose to give for the enrollment \(if succseed on the server\). We are using one of the account numbers generated from the wallet seed.

The request is sent to the server to go through face recognition steps described above. The returned result is analyzed - in case of failure, `onFaceRecognitionFailure` is triggered - generally it displays the error message and suggest to try again. on success, `onFaceRecognitionSuccess` is triggered and stores the enrollment identifier under field `zoomEnrollmentId`, and takes the user to the initially desired screen using the routing system.

For more information about Zoom integration: [https://dev.zoomlogin.com/zoomsdk/\#/docs](https://dev.zoomlogin.com/zoomsdk/#/docs)

### Zoom.js

Mainly contains the `capture` method which recieves the streaming video track from the Camera component and translates it into zoom data objects.

### Camera.web.js

{% hint style="info" %}
Please note, Currently, it is not supported as a react native component out of the box and will have to be translated into proper native components \(The  tag is web only\)
{% endhint %}

Contains a Video tag and methods that handles the actual video capture of the user.

Face Recognition is the process when the user becomes a GoodDollar citizen \(`this.props.store.get('isLoggedInCitizen')`\), and without being a citizen, the user cannot _claim GoodDollars_ or _send existing GoodDollars_ using his/hers wallet. Therefore, Face Recognition process is triggered when, assuming the user have not passed face recognition yet:

* The first time the user tries to claim for GoodDollars
* The first time the user tries to send GoodDollars

The Face Recognition process includes the following steps: 1. Capture - the user video stream is recorded and captured on the client side, using a guided wizard which tells the user how to create the capture. See LLD below for technical details.

1. If succeed, the capture \(also called ZoomCaptureResult\) is sent to the GoodServer server.
2. On the server, the zoom capture is sent to _/verify/facerecognition_ route which:
3. Calls to Zoom _liveness_ test, which check if the user passed liveness test indicators by Zoom. If passed:
4. Calls to Zoom _search_ action, which returns similar users to the user, and server checks if the capture already exists for a GoodDollar citizen already. if not \(no duplicates found for the user\):
5. The user is whitelisted on the server and becomes a citizen.
6. _/verify/facerecognition_ result is returned to the client, and the client shows error message, or continue the desired action \(claim / send\) if the user was whitelisted successfully.

### Low level technical description

The Face Recognition files are located under: [https://github.com/GoodDollar/GoodDAPP/tree/master/src/components/dashboard/FaceRecognition](https://github.com/GoodDollar/GoodDAPP/tree/master/src/components/dashboard/FaceRecognition)

#### Dashboard Integration

FaceRecognition is a component that is part of the stackNavigation of the dashboard:

```text
import FaceRecognition from './FaceRecognition/FaceRecognition'
.
.
export default createStackNavigator({
  .
  .
  FaceRecognition,
  .
  .

})
```

#### FaceRecognition.js.web

This is the main FaceRecognition container which is loaded into the dashboard.

{% hint style="info" %}
Please note, Currently, it is not supported as a react native component out of the box and will have to be translated into proper native components \(The  tag is web only\)
{% endhint %}

The component holds the  component and uses the Camera capture result to send it to the server:

```text
onCameraLoad = async (track: MediaStreamTrack) => {
      ..
      captureOutcome = await capture(track) 
      ..
      await this.performFaceRecognition(captureOutcome)
}
```

FaceRecognition request is prepared using the capture result. The capture result made by Zoom API contains the following relevant fields:

* facemap - a zip file contains user facemap data in zoomformat
* auditTrailImage - a jpg file contains user single image data in zoomformat
* sessionId - identifier for this zoom session

**enrollmentIdentifier:** an identifier GoodDollar choose to give for the enrollment \(if succeed on the server\). We are using one of the HD wallet accounts of the user, this identifier is never saved on the server in order to keep the user privacy. After the enrollment the identifier is only known to the user.

The request is sent to the server to go through face recognition steps described above. The returned result is analyzed - in case of failure, `onFaceRecognitionFailure` is triggered - generally it displays the error message and suggest to try again. on success, `onFaceRecognitionSuccess` is triggered and stores the enrollment identifier under field `zoomEnrollmentId`, and takes the user to the initially desired screen using the routing system.

For more information about Zoom integration: [https://dev.zoomlogin.com/zoomsdk/\#/docs](https://dev.zoomlogin.com/zoomsdk/#/docs)

#### Zoom.js

Mainly contains the `capture` method which receives the streaming video track from the Camera component and translates it into zoom data objects.

#### Camera.web.js

{% hint style="info" %}
Please note, Currently, it is not supported as a react native component out of the box and will have to be translated into proper native components \(The  tag is web only\)
{% endhint %}

Contains a Video tag and methods that handles the actual video capture of the user.

