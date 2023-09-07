import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import SurveyScreen from "@components/Survey/SurveyScreen";

const Stack = createStackNavigator();

export default function SurveyStack() {
    return (
        <Stack.Navigator initialRouteName="SurveyScreen" headerMode="none">
            <Stack.Screen name="SurveyScreen" component={SurveyScreen} />
        </Stack.Navigator>
    );
}
