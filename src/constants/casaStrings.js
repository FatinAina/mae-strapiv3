import { SAVINGS_ACCOUNT, CURRENT_ACCOUNT } from "@constants/strings";

/** Product Codes */
export const CASA = "CASA";
export const PRODUCT_NAME_KAWANKU = "Kawanku";
export const PRODUCT_NAME_SAI = "Saving-i";
export const PRODUCT_NAME_PM1 = "PM1";
export const PRODUCT_NAME_PMA = "PMAi";
export const PRODUCT_NAME_ZESTI = "zesti";
export const PRODUCT_NAME_M2U = "m2uPremier";

// EVents
export const EVENT_KAWANKU = "KawankuSA";
export const EVENT_SAVING_I = "SAi";

// Product Name
export const PM1_PRODUCT_NAME = "MAE_PM1";
export const PMA_PRODUCT_NAME = "MAE_PMA";
export const KAWANKU_SAVINGS_PRODUCT_NAME = "MAE_KAWANKU";
export const KAWANKU_SAVINGSI_PRODUCT_NAME = "MAE_SAVING_I";

export const CASA_STP_PRODUCTS = [
    PM1_PRODUCT_NAME,
    PMA_PRODUCT_NAME,
    KAWANKU_SAVINGS_PRODUCT_NAME,
    KAWANKU_SAVINGSI_PRODUCT_NAME,
    PRODUCT_NAME_PM1,
    PRODUCT_NAME_PMA,
    PRODUCT_NAME_KAWANKU,
    PRODUCT_NAME_SAI,
];

// CASA SERVICE TYPES
export const CASA_SERVICE_TYPES = [
    `${CASA}_${PRODUCT_NAME_PM1}`,
    `${CASA}_${PRODUCT_NAME_PMA}`,
    `${CASA}_${PRODUCT_NAME_KAWANKU}`,
    `${CASA}_${PRODUCT_NAME_SAI}`,
];

//Product Service Title
export const PM1 = "Premier 1 Account";
export const PMA = "Premier Mudharabah\nAccount-i";
export const SAVINGS = "Kawanku Savings\nAccount";
export const SAVINGSI = "Savings Account-i";

// CASA SERVICE Title
export const CASA_STP_SERVICE_TITLE = [PM1, PMA, SAVINGS, SAVINGSI];

// Product Descriptions
export const PM1_TILE_DESCRIPTION = "Attractive Multi-tier\ninterest rates";
export const PMA_TILE_DESCRIPTION = "Enjoy up to 1.15% during\ncampaign periods.";
export const SAVINGS_TILE_DESCRIPTION = "Savings at your\nconvenience";
export const SAVINGSI_TILE_DESCRIPTION = "Savings based on the\ncontract of Commodity\nMurabahah";

// CASA SERVICE Description
export const CASA_STP_DESC = [
    PM1_TILE_DESCRIPTION,
    PMA_TILE_DESCRIPTION,
    SAVINGS_TILE_DESCRIPTION,
    SAVINGSI_TILE_DESCRIPTION,
];

// Product Title
export const PM1_APPLICATION_TITLE = "Premier 1 Account Application";
export const PMA_APPLICATION_TITLE = "Premier Mudharabah Account-i Application";
export const KAWANKU_SAVINGS_APPLICATION_TITLE = "Kawanku Savings Account Application";
export const KAWANKU_SAVINGSI_APPLICATION_TITLE = "Savings Account-i Application";

// CASA SERVICE Tile Title
export const CASA_STP_TITLE = [
    PM1_APPLICATION_TITLE,
    PMA_APPLICATION_TITLE,
    KAWANKU_SAVINGS_APPLICATION_TITLE,
    KAWANKU_SAVINGSI_APPLICATION_TITLE,
];

// CASA Onboarding ID
export const CASA_ACCOUNT_ID = (product) => `ONBOARDING_${product}_INTRO`;

//Intro Screen
export const INTRO_SCREEN_DESC = (product, casaDesc) => {
    switch (product) {
        case CASA_STP_PRODUCTS[0]:
            return PM1_INTRO_SCREEN_DESC(
                casaDesc[11]?.display,
                casaDesc[12]?.display,
                casaDesc[13]?.display,
                casaDesc[14]?.display
            );
        case CASA_STP_PRODUCTS[1]:
            return PMAI_INTRO_SCREEN_DESC(casaDesc[15]?.display, casaDesc[16]?.display);
        case CASA_STP_PRODUCTS[2]:
            return SAVINGS_INTRO_SCREEN_DESC(casaDesc[17]?.display);
        case CASA_STP_PRODUCTS[3]:
            return SAVINGSI_INTRO_SCREEN_DESC(casaDesc[17]?.display);
    }
};

export const INTRO_SCREEN_ACC_TYPE = (product) => {
    switch (product) {
        case CASA_STP_PRODUCTS[0]:
            return CURRENT_ACCOUNT;
        case CASA_STP_PRODUCTS[1]:
            return INVESTMENT_ACCOUNT_TYPE;
        case CASA_STP_PRODUCTS[2]:
            return SAVINGS_ACCOUNT;
        case CASA_STP_PRODUCTS[3]:
            return SAVINGS_ACCOUNT;
    }
};

export const INTRO_SCREEN_SUB_TEXT = (product) => {
    switch (product) {
        case CASA_STP_PRODUCTS[0]:
            return PM1_ACCOUNT_SUBTEXT;
        case CASA_STP_PRODUCTS[1]:
            return PMAI_ACCOUNT_SUBTEXT;
        case CASA_STP_PRODUCTS[2]:
            return KAWANKU_SAVINGS_ACCOUNT_SUBTEXT;
        case CASA_STP_PRODUCTS[3]:
            return KAWANKU_SAVINGSI_ACCOUNT_SUBTEXT;
    }
};

/* Product Introscreen Description Welcome Screen */
export const MAE_ACCOUNT_INTRO_SCREEN_DESC = [
    "Quick online application - no branch visit required!",
    "Enjoy better foreign currency rates and up to RM10,000 e-wallet balance with a MAE debit card",
    "Easily budget and track your spending with a RM5,000 monthly transaction limit",
];

export const PM1_INTRO_SCREEN_DESC = (
    multiTieredInterest,
    accidentInsureCoverage,
    medicalCoverage,
    PIDMEachDepositor
) => [
    `To earn multi-tiered interest - With an account balance above ${multiTieredInterest} interest is calculated daily and credited monthly`,
    `Free Personal Accident insurance coverage of up to ${accidentInsureCoverage}`,
    `Free medical coverage (accident-related) of up to ${medicalCoverage}`,
    "Access to all MEPS ATMs nationwide and CIRRUS networks worldwide",
    "Deposit and withdraw funds by issuing cheques, via Autodebit, Kawanku Phone Banking, Kawanku e-Pos, MASET (MAS Electronic Ticketing) and Maybank2u.com",
    "No introducer when you apply via Maybank2u.com",
    `Protected by PIDM up to ${PIDMEachDepositor} for each depositor.`,
    "Checking facility",
];

export const PMAI_INTRO_SCREEN_DESC = (ATM, MEPSATMS) => [
    "Potential to earn higher returns with indicative profit rate",
    "Profits gained from investment are shared between Customer and Bank based on a previously agreed profit sharing ratio. Profits are paid monthly and are not subject to balance band or number of withdrawals",
    "Free personal accident Takaful coverage plus medical expenses",
    "Access to Priority and Private Banking services, subject to eligibility",
    "Cashline (Overdraft) facilities, subject to eligibility",
    `Access to over ${ATM} ATMs throughout Malaysia and Singapore and over ${MEPSATMS} MEPS ATMs nationwide`,
    "Payment convenience via Kawanku e-Pos, MASET (MAS Electronic Ticketing) and Maybank2u.com",
    "No monthly fee",
    "Checking facility",
];

export const SAVINGS_INTRO_SCREEN_DESC = (screenDesc) => [
    "Split-tiered interest rates, calculated daily and credited half-yearly in June and December",
    "Various account management options: over the counter, ATM and Debit Card, Maybank2u.com and M2U Mobile",
    `Protected by PIDM up to ${screenDesc} for each depositor`,
];

export const SAVINGSI_INTRO_SCREEN_DESC = (screenDesc) => [
    "Savings based on the contract of Commodity Murabahah",
    "Profit rates that are calculated daily and credited half-yearly in June and December",
    "Various account management options: over the counter, ATM and Debit Card, Maybank2u.com and M2U Mobile",
    `Protected by PIDM up to ${screenDesc} for each depositor`,
];

// PM1 Account
export const PM1_SIGN_UP = "Sign up for Premier 1";
export const PM1_DCRSR_CONTINUED = "and the common reporting standard requirements ";
export const PM1_PDPA_NOTE =
    "I have read,agree and accept the terms of the Maybank Group Personal Data Privacy Statement. For marketing of products and services by Maybank Group/Other Entities referred to in the";
export const PREMIER_ACCOUNT_ACTIVATION_ENTER_MYKAD =
    "Please enter your MyKad number to activate your Account ";

export const PM1_ACCOUNT_SUBTEXT = "Attractive Multi-tier interest rates";

// PMA-i Account
export const PMAI_ACCOUNT_NAME = "PMA";
export const PMA_OF = " of Premier Mudharabah Account-i.";
export const PMA_ACCOUNT_ACTIVATION_ENTER_MYKAD =
    "Please enter your MyKad number to activate your Premier Mudharabah Account application";
export const PMA_APPLICATION = "Premier 1 Account Application";
export const PMA_SAI_ALERT =
    "Based on your assessment, this account does not suit your risk profile. You may still apply for it by accepting the risk.";
export const INVESTMENT_ACCOUNT_TYPE = "Investment Account";
export const PMAI_ACCOUNT_SUBTEXT = "Attractive Multi-tier interest rates";

/* Kawanku Account */
export const KAWANKU_SAVINGS_SERVICE_TYPE = "Kawanku-SA";
export const KAWANKU_SAVINGS_ACCOUNT_NAME = "Kawanku Savings Account";
export const KAWANKU_SAVINGS_ACCOUNT_SUBTEXT = "Savings at your convenience ";
export const KAWANKU_SAVINGS_ACCOUNT_ACTIVATION_ENTER_MYKAD =
    "Please enter your MyKad number to activate your Kawanku Savings Account application";

/* Kawamku Savings-I Account*/
export const KAWANKU_SAVINGSI_SERVICE_TYPE = "Kawanku-SAI";
export const SAVINGS_ACCOUNT_I = "Savings Account-i";
export const KAWANKU_SAVINGSI_ACCOUNT_SUBTEXT =
    "Savings based on the contract of Commodity Murabahah";

//Premier Declaration Screen
export const DECLARATION_SUB_HEADER = "I hereby confirm, consent and declare that:";
export const DECLARATION_NON_US_PERSON = "I am a Non-US Person with no US Indicia";
export const TAX_RESIDENT_MY = "I am a Tax Resident in Malaysia";
export const DECLARATION_PIRACY_PARA1 =
    "I have read, agree and accept the terms of The Maybank Group ";
export const DECLARATION_PIRACY_PARA2 =
    " For marketing or products and services by Maybank Group/other entities referred to in the Privacy Statement:";
export const DECLARATION_BROCHURE_SUB_HEADING =
    "I understand that this account is not protected by PIDM and I have read ";
export const DECLARATION_BROCHURE_SUB_HEADING2 = (amount) =>
    `I understand that this account is protected by PIDM up to ${amount} for each depositor. I have read `;
export const DECLARATION_IMPOSE_PARA = (monthlyFee, ADB) =>
    `I understand that this account is imposed with maintenance fees: Monthly Fee of ${monthlyFee} will be imposed if the Average Daily Balance (ADB) is less than ${ADB}.`;

/* Kawanku Declaration */
export const SAVINGS_DECLARATION_FATCA =
    "I confirm that I do not meet the definition of a US person or fall under any of the indicias mentioned in the ";
export const SAVINGS_DECLARATION_FATCA_HL = "US Foreign Account Tax Compliance Act ('FATCA')";
export const SAVINGS_DECLARATION_DCRSR =
    "I confirm that I am not a tax resident of any other jurisdiction (other than Malaysia) and agree to be bound by the terms of the declaration in the ";
export const SAVINGS_DECLARATION_CRS_CERTIFICATION = "FATCA/CRS self certification form";
export const SAVINGS_DECLARATION_FATCA_AGREE =
    " and agree to be bound by the terms of the declaration in the ";
export const SAVINGS_DECLARATION_CRS_CONTINUED =
    " in the attached link. I further undertake to notify Maybank in writing within 30 calendar days of any change of circumstances which cause the information contained herein to become incorrect.";
export const SAVINGS_DECLARATION_DCRSR_CONTINUED =
    " and the common reporting standard requirements in the attached link. I further undertake to notify Maybank in writing within 30 calendar days of any change of circumstances which cause the information contained herein to become incorrect.";

/* Miscellaneous */
export const PREMIER_INITIAL_DEPOSIT = (activationAmount) =>
    `Make an initial deposit of RM ${activationAmount}`;
export const PREMIER_SUCCESS_MESSAGE = "Your account has been successfully created!";
export const PREMIER_VISIT_BRANCH = "Visit branch to activate account";
export const PREMIER_M2U_ID = "Your Maybank2U ID has been created";
export const PREMIER_M2U_ID_PASSPORT = "Your M2U access has been registered";
export const PREMIER_FATCA =
    "I confirm that I do not meet the definition of a US person or fall under any of the indicias mentioned in the ";
export const PREMIER_DCRSR =
    "I confirm that I am not a tax resident of any other jurisdiction (other than Malaysia) and agree to be bound by the terms of the declaration in the ";
export const PREMIER_DCRSR_CONTINUED = "and the common reporting standard requirements ";
export const PREMIER_PRIVACY_NOTE =
    "I have read, agree and accept the terms of the Maybank Group Personal Data Privacy Statement. For marketing of products and services by Maybank Group/Other Entities referred to in the ";
export const PREMIER_ALLOW_PROCESS_PI =
    "Yes, I/we expressly agree to Maybank \nGroup and/or Other Entities processing \nmy/our personal data and to be contacted \nfor promotional and marketing purposes. \nor";
export const PREMIER_NOT_ALLOW_PROCESS_PI =
    "No, I/we do not agree to Maybank Group \nand/or Other Entities processing my/our \npersonal data or to be contacted  for \npromotional and marketing purposes. ";
export const PMA_PIDM_PHRASE =
    "I understand that this account is not protected by PIDM. I have received a copy of ";
export const M2U_REGISTRATION = "Register Maybank2u to continue your application.";
export const M2U_REGISTRATION_DESC =
    "We noticed that you're an existing Maybank customer. \n\nKindly register for Maybank2u online banking access to continue this application.";
export const M2U_REGISTRATION_BUTTON = "Register Maybank2u";
export const PREMIER_CASA_COULD_NOT_PROCEED_APPLICATION =
    "We couldn't proceed with your application. Kindly visit a nearby branch to submit your application.";
export const MAYBE_LATER_TEXT = "Maybe Later";
export const FILL_IN_PREFERRED_BRANCH = "Please fill in your preferred branch\ndetails";
export const FILL_IN_PREFERRED_BRANCH2 =
    "We've pre-selected your nearest branch. Kindly edit as you see fit.";
export const PREMIER_PLSTP_AGREE_NOTE =
    "I hereby agree to accept this product/service and that the use of electronic messages and electronic acceptance for all matters related to this product/service shall be binding in accordance with the Electronic Commerce Act 2006.";
export const MAE_ACCOUNT_TEXT =
    "Get better at managing and tracking your daily spending with this e-wallet's lower balance and transaction limit.";
export const ACCOUNT_NOT_OPENED_MESSAGE = "We currently have not opened application for you.";
export const ACCOUNT_LIST_NOT_FOUND_MESSAGE = "We are unable to fetch a list of your accounts.";
export const STEP1OF5 = "Step 1 of 5";
export const STEP2OF5 = "Step 2 of 5";
export const STEP3OF5 = "Step 3 of 5";
export const STEP4OF5 = "Step 4 of 5";
export const STEP5OF5 = "Step 5 of 5";
export const STEP1OF4 = "Step 1 of 4";
export const STEP2OF4 = "Step 2 of 4";
export const STEP3OF4 = "Step 3 of 4";
export const STEP4OF4 = "Step 4 of 4";
export const STEP1OF3 = "Step 1 of 3";
export const STEP2OF3 = "Step 2 of 3";
export const STEP3OF3 = "Step 3 of 3";

// M2U Premier ONBOARDING SUCCESS
export const M2U_PREMIER_ONBOARDING_SUCCESS = "You are almost there! Next, you will only need to";

//MyKad ONBOARDING SUCCESS
export const MYKAD_PREMIER_ONBOARDING_SUCCESS = "Next, you will need to";

export const INSUFFICIENT_BALANCE =
    "Your account balance is insufficient.\nPlease select another account.";

export const MINIMUM_INCOME_TEXT = (amount) => `Minimum income is ${amount} and above`;

// Account Activation Screen
export const ACTIVATION_SUCCESSFUL_CARD_SUCCESSFUL =
    "Congratulations! You can start using your account now. Your card is on its way, you should receive it within 7 working days";
export const ACTIVATION_SUCCESSFUL_CARD_UNSUCCESSFUL =
    "However, your debit card application was unsuccessful. Kindly apply again via this app after your Secure2u is activated.";

// Account Creation
export const ACC_SUCC_NEW_HEADING = "Account successfully created!";
export const ACC_SUCC_NEW_PARA1 =
    "Register your M2U access to log in and enjoy our online banking services.";
export const ACC_SUCC_NEW_PARA2 = "Make an initial deposit to activate your account.";
export const ACC_SUCC_NEW_PARA3 = (debitCardFee) =>
    `An ${debitCardFee} debit card fee will be deducted from your activated account.`;
export const ACC_SUCC_CREATE_BUTTON = "Register M2U Access";

// Personal Details Popup
export const PERSONAL_POPUP_PARA_2 =
    "Immediate family members, next-of-kin, close friend, business associate of a PEP. E.g. parents, siblings, spouses, children, In-Law, Bodyguard, Political Secretary, Business Partner, Personal Advisor etc.";

//Prefer Branch
export const NEAREST_BRANCH = "Nearest Branch";
export const SELECTED_NEAREST_BRANCH = "We've pre-selected your nearest branch";
export const PREFER_OTHER_BRANCH = "I Prefer Another Branch";
export const DEBIT_CARD_ACTIVATION_UNSUCCESSFUL =
    "However, your PIN change was unsuccessful. Kindly reset your PIN.";
export const DEBIT_CARD_APPLICATION_SUCCESSFUL = "Your card is on its way!";
export const DEBIT_CARD_APPLICATION_SUCCESSFUL_DESC =
    "You should receive it within 7 working days.";

export const FILL_IN_EDIT_RESIDENTIAL_DETAILS =
    "We've pre-filled your residential address. Kindly edit as you see fit";
export const CASA_ACTIVATION_CHOICE_DESCRIPTION_ACTIVATE =
    "You can Next to activate your account now or at any of our branches within 10 business days.";

export const CASA_ZOLOS_MAX_TRY_HEADER = "Account Application";
export const CASA_ZOLOS_MAX_TRY_SUB_HEADER =
    "We are having problem verifying your identity. You may continue with the account application and activate it at the nearest branch";
export const CASA_ZOLOS_MAX_TRY_PARA_HEADER = "To activate at the branch, you will be required to:";
export const CASA_ZOLOS_MAX_TRY_PARA_FIRST =
    "Prepare your NRIC for account activation at the branch";

// EKYC Max Retry Fail
export const APPLICATION_SUBMITTED = "Application Submitted";

export const ARE_YOU_PEP_OR_PEP_RELATIVE =
    "Are you a politically exposed person (PEP) or a relative/close associate of a PEP?";

export const DECLARATION_SUB_HEADER_TEXT = "declarationSubHeaderText";
export const VISIT_BRANCH_TEXT = "visitBranchText";
