import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import { withModelContext } from "@context";

import { PreferredAmountList } from "./PreferredAmountList";

const RemovePreferredAmount = ({
    preferredAmountList,
    setShowAddButton,
    handleRemoval,
    setHideHeader,
    setPopupVisible,
    setSelectedItem,
    onItemDelete,
    handleClosePopup,
}) => {
    const requestTodelete = (el) => {
        setPopupVisible(true);
        setHideHeader(false);
        setSelectedItem(el);
    };

    return (
        <View style={styles.container}>
            {/* Background content */}
            <PreferredAmountList
                items={preferredAmountList}
                textKey="preferredList"
                hasRadio={false}
                setShowAddButton={setShowAddButton}
                requestTodelete={requestTodelete}
                onItemDelete={onItemDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

RemovePreferredAmount.defaultProps = {
    preferredAmountList: [],
};

RemovePreferredAmount.propTypes = {
    preferredAmountList: PropTypes.any,
    setShowAddButton: PropTypes.bool,
    handleRemoval: PropTypes.func,
    setHideHeader: PropTypes.bool,
    setPopupVisible: PropTypes.bool,
    handleClosePopup: PropTypes.func,
    setSelectedItem: PropTypes.any,
    onItemDelete: PropTypes.func,
};

export default withModelContext(RemovePreferredAmount);
