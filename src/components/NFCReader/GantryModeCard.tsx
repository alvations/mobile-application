import { Animated, View } from "react-native";
import React, { FunctionComponent, useRef, useEffect, useState } from "react";
import { GantryModeToggler } from "../CustomerDetails/GantryModeToggler";
import { size, color, borderRadius, shadow } from "../../common/styles";
import { usePrevious } from "../../hooks/usePrevious";

const springProps = {
  stiffness: 200,
  damping: 100,
  mass: 3
};

export const GantryModeCard: FunctionComponent<{ visible: boolean }> = ({
  visible
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(true);

  const prevVisible = usePrevious(visible);

  useEffect(() => {
    if (prevVisible === visible) {
      return;
    }
    if (visible) {
      setMounted(true);
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...springProps
      }).start();
    } else {
      slideAnim.setValue(1);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...springProps
      }).start(() => setMounted(false));
    }
  }, [prevVisible, slideAnim, visible]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [200, 0]
            })
          }
        ]
      }}
    >
      {mounted && (
        <View
          style={{
            paddingTop: size(3),
            paddingBottom: size(4),
            paddingHorizontal: size(3),
            marginHorizontal: size(2),
            backgroundColor: color("grey", 0),
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: color("grey", 20),
            borderRadius: borderRadius(3),
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            ...shadow(1)
          }}
        >
          <GantryModeToggler />
        </View>
      )}
    </Animated.View>
  );
};
