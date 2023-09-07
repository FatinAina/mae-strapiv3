import { useFocusEffect } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PropTypes from "prop-types";
import React from "react";

import HomeScreen from "@screens/Dashboard/Home";

const Stack = createStackNavigator();

export default function HomeStack({ navigation }) {
    /**
     * more stacks has been defined to be unmount on blur in the tab
     * apparently, param didn't get reset upon unmount
     * https://github.com/react-navigation/react-navigation/issues/6915
     * eg navigate('More', { screen: 'TabTabung' }) the screen param will
     * persist as long as its here. So this help to reset the param when
     * the stack got unmounted
     */
    useFocusEffect(
        React.useCallback(() => {
            return () => navigation.setParams({ screen: undefined });
        }, [navigation])
    );

    return (
        <Stack.Navigator initialRouteName="Home" headerMode="none">
            <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
    );
}

HomeStack.propTypes = {
    navigation: PropTypes.object,
};
