import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import AddPreferredAmount from "@screens/ATMCashout/AddPreferredAmount";
import AmountScreen from "@screens/ATMCashout/AmountScreen";
import AtmCheckPoint from "@screens/ATMCashout/AtmCheckPoint";
import AtmNotAvailable from "@screens/ATMCashout/AtmNotAvailable";
import AtmOTPNumber from "@screens/ATMCashout/AtmOTPNumber";
import CashOutConfirmation from "@screens/ATMCashout/CashOutConfirmation";
import CashoutAddToFavourites from "@screens/ATMCashout/CashoutAddToFavourites";
import CashoutStatus from "@screens/ATMCashout/CashoutStatus";
import CheckRevampNavigation from "@screens/ATMCashout/CheckRevampNavigation";
import PreferredAmount from "@screens/ATMCashout/PreferredAmount";
import { PreferredAmountList } from "@screens/ATMCashout/PreferredAmountList";
import PreferredAmountValue from "@screens/ATMCashout/PreferredAmountValue";
import ProcessingScreen from "@screens/ATMCashout/ProcessingScreen";
import RemovePreferredAmount from "@screens/ATMCashout/RemovePreferredAmount";
import ShareReceipt from "@screens/ATMCashout/ShareReceipt";
import WithdrawalConfirmation from "@screens/ATMCashout/WithdrawalConfirmation";

const Stack = createStackNavigator();

export default function ATMCashoutStack() {
    return (
        <Stack.Navigator
            initialRouteName="CashOutConfirmation"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="CashOutConfirmation" component={CashOutConfirmation} />
            <Stack.Screen name="CashoutStatus" component={CashoutStatus} />
            <Stack.Screen name="PreferredAmount" component={PreferredAmount} />
            <Stack.Screen name="ProcessingScreen" component={ProcessingScreen} />
            <Stack.Screen name="AmountScreen" component={AmountScreen} />
            <Stack.Screen name="WithdrawalConfirmation" component={WithdrawalConfirmation} />
            <Stack.Screen name="ShareReceipt" component={ShareReceipt} />
            <Stack.Screen name="AtmOTPNumber" component={AtmOTPNumber} />
            <Stack.Screen name="AtmCheckPoint" component={AtmCheckPoint} />
            <Stack.Screen name="CashoutAddToFavourites" component={CashoutAddToFavourites} />
            <Stack.Screen name="AtmNotAvailable" component={AtmNotAvailable} />
            <Stack.Screen name="AddPreferredAmount" component={AddPreferredAmount} />
            <Stack.Screen name="PreferredAmountValue" component={PreferredAmountValue} />
            <Stack.Screen name="RemovePreferredAmount" component={RemovePreferredAmount} />
            <Stack.Screen name="PreferredAmountList" component={PreferredAmountList} />
            <Stack.Screen name="CheckRevampNavigation" component={CheckRevampNavigation} />
        </Stack.Navigator>
    );
}
