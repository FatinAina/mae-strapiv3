import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import {
    CARBON_OFFSET_SCREEN,
    DONATE_CONFIRMATION_SCREEN,
    DONATE_SCREEN,
    DONATION_HISTORY_SCREEN,
    FOOTPRINT_DETAILS_SCREEN,
    CARBON_OFFSET_STATUS_SCREEN,
} from "@navigation/navigationConstant";

import { useModelController } from "@context";

function FootprintDetailDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/EthicalCard/FootprintDashboard.js").default;
    return <Screen {...props} />;
}

function CarbonOffsetScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/EthicalCard/CarbonOffsetScreen.js").default;
    return <Screen {...props} />;
}

function DonationHistoryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/EthicalCard/DonationHistoryScreen.js").default;
    return <Screen {...props} />;
}

function DonateScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/EthicalCard/DonateScreen.js").default;
    return <Screen {...props} />;
}

function CarbonOffsetConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/EthicalCard/CarbonOffsetConfirmation.js").default;
    return <Screen {...props} />;
}

function CarbonOffsetStatusScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/EthicalCard/CarbonOffsetStatusScreen.js").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function EthicalCardStack() {
    return (
        <Stack.Navigator initialRouteName={FOOTPRINT_DETAILS_SCREEN} headerMode="none">
            <Stack.Screen name={CARBON_OFFSET_SCREEN} component={CarbonOffsetScreen} />
            <Stack.Screen name={DONATION_HISTORY_SCREEN} component={DonationHistoryScreen} />
            <Stack.Screen name={DONATE_SCREEN} component={DonateScreen} />
            <Stack.Screen name={FOOTPRINT_DETAILS_SCREEN} component={FootprintDetailDashboard} />
            <Stack.Screen name={DONATE_CONFIRMATION_SCREEN} component={CarbonOffsetConfirmation} />
            <Stack.Screen name={CARBON_OFFSET_STATUS_SCREEN} component={CarbonOffsetStatusScreen} />
        </Stack.Navigator>
    );
}
