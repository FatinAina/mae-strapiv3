import React from "react";
import { View, FlatList } from "react-native";
import OwnAccountItem from "./OwnAccountItem";

const OwnAccountList = ({ data, extraData, callback, showLastLine = false }) => {
    return (
        <View>
            <FlatList
                data={data}
                extraData={extraData}
                scrollToIndex={0}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                renderItem={({ item, index }) => (
                    <OwnAccountItem
                        item={item}
                        callback={callback}
                        isLast={data && data.length >= 1 && data.length - 1 === index}
                    />
                )}
                testID={"ownAccountList"}
                accessibilityLabel={"ownAccountList"}
            />
        </View>
    );
};

export default OwnAccountList;
