import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { GREY, YELLOW } from "@constants/colors";

const HorizontalRadioButton = ({ valueList, selectedValue, onPress }) => {
    const onSelectAmount = (val) => {
        onPress(val);
    };

    return (
        <View style={styles.container}>
            {valueList.map((val) => {
                return (
                    <TouchableOpacity
                        style={[
                            styles.buttonContainer,
                            // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
                            {
                                borderColor: val === selectedValue ? YELLOW : GREY,
                                backgroundColor: val === selectedValue ? YELLOW : null,
                            },
                        ]}
                        onPress={() => {
                            onSelectAmount(val);
                        }}
                        key={`${val}`}
                    >
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={21}
                            text={`${val}`}
                            textAlign="left"
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

HorizontalRadioButton.propTypes = {
    valueList: PropTypes.array,
    selectedValue: PropTypes.any,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    container: { flexDirection: "row", justifyContent: "space-between", marginVertical: 15 },
    buttonContainer: {
        borderWidth: 1,
        borderRadius: 4,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default HorizontalRadioButton;
