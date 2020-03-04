import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Svg, Defs, Rect, Mask, Ellipse } from "react-native-svg";
function createElement(name, type) {
  function CreateElement(props) {
    return React.createElement(type, props, props.children);
  }

  //   CreateElement.displayName = name;

  //   CreateElement.propTypes = {
  //     children: null
  //   };

  //   CreateElement.defaultProps = {
  //     children: null
  //   };

  return CreateElement;
}
const MaskSvg = () => Mask || createElement("Mask", "mask");

const WrappedSvg = ({ ellipseProps, rectProps, color }) => {
  const Mask = MaskSvg();
  return (
    <View>
      <Svg height="100%" width="100%">
        <Defs>
          <Mask id="mask" x="0" y="0" height="100%" width="100%">
            <Rect height="100%" width="100%" fill="#fff" />
            <Ellipse cx="50%" cy="50%" rx="35%" ry="35%" {...ellipseProps} />
          </Mask>
        </Defs>
        <Rect
          height="100%"
          width="100%"
          color="blue"
          fill={color}
          mask="url(#mask)"
          //fill-opacity="0"
          {...rectProps}
        />
      </Svg>
    </View>
  );
};

const CameraOverlay = props => {
  const [overlay, setOverlay] = useState(false);
  useEffect(() => {
    //solve bug, svg not shown on first render
    setOverlay(true);
  }, []);
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: "100%",
        width: "100%"
      }}
    >
      {overlay && <WrappedSvg {...props} />}
    </View>
  );
};

export default CameraOverlay;
