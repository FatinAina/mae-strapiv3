import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import M2UOnlineRegistration from "@screens/CasaSTP/Components/M2UOnlineRegistration";
import PremierAccountDetails from "@screens/CasaSTP/PremierAccountDetails";
import PremierAccountNotFound from "@screens/CasaSTP/PremierAccountNotFound";
import PremierActivateAccount from "@screens/CasaSTP/PremierActivateAccount";
import PremierActivateAccountIdentityDetails from "@screens/CasaSTP/PremierActivateAccountIdentityDetails";
import PremierActivationChoice from "@screens/CasaSTP/PremierActivationChoice";
import PremierActivationFailure from "@screens/CasaSTP/PremierActivationFailure";
import PremierActivationPending from "@screens/CasaSTP/PremierActivationPending";
import PremierActivationSuccess from "@screens/CasaSTP/PremierActivationSuccess";
import PremierAdditionalDetails from "@screens/CasaSTP/PremierAdditionalDetails";
import PremierConfirmation from "@screens/CasaSTP/PremierConfirmation";
import PremierDeclaration from "@screens/CasaSTP/PremierDeclaration";
import PremierEditCASATransferAmount from "@screens/CasaSTP/PremierEditCASATransferAmount";
import PremierEmploymentDetails from "@screens/CasaSTP/PremierEmploymentDetails";
import PremierIdentityDetails from "@screens/CasaSTP/PremierIdentityDetails";
import PremierIntroScreen from "@screens/CasaSTP/PremierIntroScreen";
import PremierLoginEntry from "@screens/CasaSTP/PremierLoginEntry";
import PremierM2USuccess from "@screens/CasaSTP/PremierM2USuccess";
import PremierOtpVerification from "@screens/CasaSTP/PremierOtpVerification";
import PremierPersonalDetails from "@screens/CasaSTP/PremierPersonalDetails";
import PremierPreferBranch from "@screens/CasaSTP/PremierPreferBranch";
import PremierResidentialDetails from "@screens/CasaSTP/PremierResidentialDetails";
import PremierSelectCASA from "@screens/CasaSTP/PremierSelectCASA";
import PremierSelectFPXBank from "@screens/CasaSTP/PremierSelectFPXBank";
import PremierSuccessMyKad from "@screens/CasaSTP/PremierSuccessMyKad";
import PremierSuitabilityAssessment from "@screens/CasaSTP/PremierSuitabilityAssessment";

import {
    PREMIER_IDENTITY_DETAILS,
    PREMIER_PERSONAL_DETAILS,
    PREMIER_RESIDENTIAL_DETAILS,
    PREMIER_EMPLOYMENT_DETAILS,
    PREMIER_ACCOUNT_DETAILS,
    PREMIER_ADDITIONAL_DETAILS,
    PREMIER_PREFER_BRANCH,
    PREMIER_DECLARATION,
    PREMIER_CONFIRMATION,
    PREMIER_SUITABILITY_ASSESSMENT,
    PREMIER_OTP_VERIFICATION,
    PREMIER_ACTIVATE_ACCOUNT,
    PREMIER_SELECT_FPX_BANK,
    PREMIER_SELECT_CASA,
    PREMIER_LOGIN_ENTRY,
    PREMIER_EDIT_CASA_TRANSFER_AMOUNT,
    PREMIER_ACTIVATION_PENDING,
    PREMIER_ACCOUNT_NOT_FOUND,
    PREMIER_SUCCESS_MYKAD,
    PREMIER_ACTIVATION_CHOICE,
    PREMIER_ACTIVATION_SUCCESS,
    PREMIER_ACTIVATION_FAILURE,
    PREMIER_M2U_REGISTRATION,
    PREMIER_M2U_SUCCESS,
    PREMIER_ACTIVATE_ACCOUNT_IDENTITY_DETAILS,
    PREMIER_INTRO_SCREEN,
} from "@navigation/navigationConstant";

const Stack = createStackNavigator();

export default function PremierModuleStack() {
    return (
        <Stack.Navigator
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name={PREMIER_IDENTITY_DETAILS} component={PremierIdentityDetails} />
            <Stack.Screen
                name={PREMIER_SUITABILITY_ASSESSMENT}
                component={PremierSuitabilityAssessment}
            />
            <Stack.Screen name={PREMIER_PERSONAL_DETAILS} component={PremierPersonalDetails} />
            <Stack.Screen
                name={PREMIER_RESIDENTIAL_DETAILS}
                component={PremierResidentialDetails}
            />
            <Stack.Screen name={PREMIER_EMPLOYMENT_DETAILS} component={PremierEmploymentDetails} />
            <Stack.Screen name={PREMIER_ACCOUNT_DETAILS} component={PremierAccountDetails} />
            <Stack.Screen name={PREMIER_ADDITIONAL_DETAILS} component={PremierAdditionalDetails} />
            <Stack.Screen name={PREMIER_PREFER_BRANCH} component={PremierPreferBranch} />
            <Stack.Screen name={PREMIER_DECLARATION} component={PremierDeclaration} />
            <Stack.Screen name={PREMIER_CONFIRMATION} component={PremierConfirmation} />
            <Stack.Screen name={PREMIER_LOGIN_ENTRY} component={PremierLoginEntry} />
            <Stack.Screen name={PREMIER_SELECT_CASA} component={PremierSelectCASA} />
            <Stack.Screen name={PREMIER_SELECT_FPX_BANK} component={PremierSelectFPXBank} />
            <Stack.Screen name={PREMIER_ACTIVATION_PENDING} component={PremierActivationPending} />
            <Stack.Screen name={PREMIER_ACCOUNT_NOT_FOUND} component={PremierAccountNotFound} />
            <Stack.Screen
                name={PREMIER_EDIT_CASA_TRANSFER_AMOUNT}
                component={PremierEditCASATransferAmount}
            />
            <Stack.Screen name={PREMIER_SUCCESS_MYKAD} component={PremierSuccessMyKad} />
            <Stack.Screen name={PREMIER_ACTIVATION_CHOICE} component={PremierActivationChoice} />
            <Stack.Screen name={PREMIER_M2U_SUCCESS} component={PremierM2USuccess} />
            <Stack.Screen name={PREMIER_OTP_VERIFICATION} component={PremierOtpVerification} />
            <Stack.Screen name={PREMIER_ACTIVATE_ACCOUNT} component={PremierActivateAccount} />
            <Stack.Screen name={PREMIER_M2U_REGISTRATION} component={M2UOnlineRegistration} />
            <Stack.Screen
                name={PREMIER_ACTIVATE_ACCOUNT_IDENTITY_DETAILS}
                component={PremierActivateAccountIdentityDetails}
            />
            <Stack.Screen name={PREMIER_ACTIVATION_SUCCESS} component={PremierActivationSuccess} />
            <Stack.Screen name={PREMIER_ACTIVATION_FAILURE} component={PremierActivationFailure} />
            <Stack.Screen name={PREMIER_INTRO_SCREEN} component={PremierIntroScreen} />
        </Stack.Navigator>
    );
}
