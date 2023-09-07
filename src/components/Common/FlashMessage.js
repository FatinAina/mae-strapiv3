import React from "react";
import { View, Button } from "react-native";
import { showMessage, hideMessage } from "react-native-flash-message";

import { YELLOW } from "@constants/colors";

class FlashMessage {
    showContentSaveMessage(message, description, position, type) {
        showMessage({
            message: message,
            description: description,
            backgroundColor: YELLOW,
            color: "#000000",
            position: position,
            floating: true,
            duration: 2000,
            animationDuration: 1000,
            animated: true,
            hideOnPress: true,
            type: type,
            icon: "none",
        });
    }
}

export default new FlashMessage();
