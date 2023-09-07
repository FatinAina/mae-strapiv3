import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";

import assets from "@assets";

const EyePassword = ({ onShowPassword }) => {
    const [showPassword, setShowPassword] = useState(false);
    const icon = showPassword ? assets.eye : assets.eyeLash;

    const handlePress = (indicator) => {
        setShowPassword(indicator);
        onShowPassword(indicator);
    };

    return (
        <TouchableOpacity
            style={styles.iconContainer}
            onPressIn={() => handlePress(true)}
            onPressOut={() => handlePress(false)}
            hitSlop={styles.hitSlop}
        >
            <Image source={icon} />
        </TouchableOpacity>
    );
};

EyePassword.propTypes = {
    onShowPassword: PropTypes.func,
};

export default EyePassword;

const styles = StyleSheet.create({
    iconContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        right: 0,
    },
    hitSlop: {
        top: 50,
        bottom: 50,
        left: 30,
        right: 30,
    },
});
