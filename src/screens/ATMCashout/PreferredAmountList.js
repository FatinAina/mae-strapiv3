import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from "react-native";

import RadioButton from "@components/Buttons/RadioButton";
import Typo from "@components/Text";

import { WHITE, BLACK } from "@constants/colors";

import Images from "@assets";

const Item = ({
    item,
    key,
    hasRadio,
    setShowAddButton,
    requestTodelete,
    onItemPressed,
    selectedItemId,
}) => {
    const isSelected = selectedItemId === item;

    return (
        <View style={styles.preferredAmtBlock}>
            <View style={styles.preferredAmtValue}>
                {hasRadio ? (
                    <RadioButton
                        key={`radio-${key}`}
                        title={
                            <View style={styles.textContainer}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={24}
                                    text={`RM ${Numeral(item)?.format("0,0.00")}`}
                                />
                            </View>
                        }
                        isSelected={isSelected}
                        onRadioButtonPressed={() => {
                            onItemPressed(item);
                        }}
                    />
                ) : (
                    <View style={styles.removal}>
                        <View style={styles.textContainer}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={24}
                                text={`RM ${Numeral(item)?.format("0,0.00")}`}
                                color={BLACK}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (hasRadio) {
                                    onItemPressed();
                                } else {
                                    requestTodelete(item);
                                }
                            }}
                            style={styles.closeButton}
                        >
                            <Image source={Images.encircledCloseIcon} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const PreferredAmountList = ({
    onItemPressed,
    textKey,
    hasRadio,
    setShowAddButton,
    items,
    requestTodelete,
    selectedItemId,
    setSelectedItemId,
}) => {
    const handleItemPress = (itemId) => {
        setSelectedItemId(itemId);
        onItemPressed(itemId);
        console.log(`handleItemPress ${itemId}`);
    };

    const renderItems = ({ item, key }) => {
        return (
            items && (
                <Item
                    key={key || `key-${item}`}
                    item={item}
                    onItemPressed={handleItemPress}
                    textKey={textKey}
                    hasRadio={hasRadio}
                    setShowAddButton={setShowAddButton}
                    requestTodelete={requestTodelete}
                    selectedItemId={selectedItemId}
                />
            )
        );
    };

    return (
        items && (
            <View style={styles.container}>
                <FlatList
                    data={items}
                    renderItem={renderItems}
                    showsVerticalScrollIndicator={true}
                    key={textKey}
                    keyExtractor={(item) => item}
                />
            </View>
        )
    );
};

const styles = StyleSheet.create({
    removal: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    container: (items) => ({
        height: items.length === 1 ? 65 : items.length === 2 ? 130 : 200,
    }),
    preferredAmtBlock: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 56,
        marginTop: 8,
        width: "100%",
    },
    preferredAmtValue: {
        paddingHorizontal: 16,
        paddingVertical: 17,
    },
    textContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    closeButton: {
        marginLeft: "auto",
    },
});

Item.propTypes = {
    item: PropTypes.any,
    key: PropTypes.any,
    hasRadio: PropTypes.any,
    setShowAddButton: PropTypes.any,
    requestTodelete: PropTypes.any,
    onItemPressed: PropTypes.any,
    selectedItemId: PropTypes.any,
};

PreferredAmountList.propTypes = {
    onItemPressed: PropTypes.func,
    textKey: PropTypes.any,
    hasRadio: PropTypes.any,
    setShowAddButton: PropTypes.any,
    items: PropTypes.any,
    requestTodelete: PropTypes.any,
    selectedItemId: PropTypes.any,
    setSelectedItemId: PropTypes.any,
};

export { PreferredAmountList };
