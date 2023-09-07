import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";

import ExternalUrlScreen from "@screens/Dashboard/ExternalUrl";
import CashbackCampaign from "@screens/Dashboard/Festives/CashbackCampaign";
import FestiveQuickActionScreen from "@screens/Dashboard/Festives/FestiveQuickActionScreen";
import GameStatus from "@screens/Dashboard/Festives/GameStatus";
import SendGreetingsContactsScreen from "@screens/Dashboard/Festives/SendGreetingsContacts";
import SendGreetingsDesignScreen from "@screens/Dashboard/Festives/SendGreetingsDesign";
import SendGreetingsReceivedScreen from "@screens/Dashboard/Festives/SendGreetingsReceived";
import SendGreetingsReviewScreen from "@screens/Dashboard/Festives/SendGreetingsReview";
import SendGreetingsSelectedScreen from "@screens/Dashboard/Festives/SendGreetingsSelected";
import SendGreetingsStatusScreen from "@screens/Dashboard/Festives/SendGreetingsStatus";
import ManageDashboardScreen from "@screens/Dashboard/ManageDashboard";
import CustomiseQuickAction from "@screens/Dashboard/QuickActions/CustomiseQuickActions";
import FinancialGoalsDashboardScreen from "@screens/FinancialGoals/FinancialGoalsDashboardScreen";
import NotificationsScreen from "@screens/Notifications";
import SecureTACScreen from "@screens/OneTapAuth/SecureTAC";
import SettingsScreen from "@screens/Settings";
import MoreScreen from "@screens/TabNav/Menu";

const Stack = createStackNavigator();

function DashboardRoot() {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name="ManageDashboard" component={ManageDashboardScreen} />
            <Stack.Screen name="FestiveQuickActionScreen" component={FestiveQuickActionScreen} />
            <Stack.Screen name="SendGreetingsContacts" component={SendGreetingsContactsScreen} />
            <Stack.Screen name="SendGreetingsSelected" component={SendGreetingsSelectedScreen} />
            <Stack.Screen name="SendGreetingsDesign" component={SendGreetingsDesignScreen} />
            <Stack.Screen name="SendGreetingsReview" component={SendGreetingsReviewScreen} />
            <Stack.Screen name="SendGreetingsStatus" component={SendGreetingsStatusScreen} />
            <Stack.Screen name="SendGreetingsReceived" component={SendGreetingsReceivedScreen} />
            <Stack.Screen name="CashbackCampaign" component={CashbackCampaign} />
            <Stack.Screen name="GameStatus" component={GameStatus} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CustomiseQuickAction" component={CustomiseQuickAction} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="SecureTAC" component={SecureTACScreen} />
            <Stack.Screen name="Menu" component={MoreScreen} />
            <Stack.Screen
                name="FinancialGoalsDashboardScreen"
                component={FinancialGoalsDashboardScreen}
            />
        </Stack.Navigator>
    );
}

export default function DashboardStacks() {
    return (
        <Stack.Navigator initialRouteName="Dashboard" headerMode="none" mode="modal">
            <Stack.Screen name="Dashboard" component={DashboardRoot} />
            <Stack.Screen
                name="ExternalUrl"
                component={ExternalUrlScreen}
                options={{
                    ...TransitionPresets.ModalPresentationIOS,
                }}
            />
        </Stack.Navigator>
    );
}
