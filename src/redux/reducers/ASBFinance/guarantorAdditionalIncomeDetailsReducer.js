import numeral from "numeral";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    GUARANTOR_FIXED_ALLOWANCE,
    GUARANTOR_NON_FIXED_AALOWANCE,
    GUARANTOR_EPF_DIVIDEND,
    GUARANTOR_COMMISSION,
    GUARANTOR_HOUSEHOLD_INCOME,
    GUARANTOR_BONUS_TYPE,
    GUARANTOR_ANNUAL_BONUS_AMOUNT,
    GUARANTOR_TOTAL_AMOUNT,
    GUARANTOR_ADDITIONAL_INCOME_DEATAIL_SUBMIT_BUTTON_ENABLE,
    GUARANTOR_ADDITIONAL_INCOME_DETAILS_CLEAR,
} from "@redux/actions/ASBFinance/guarantorAdditionalIncomeDetailsAction";

const initialState = {
    fixedAllowance: null,
    nonFixedAllowance: null,
    epfDividend: null,
    commission: null,
    householdIncome: null,
    bonusType: null,
    annualBonusAmount: null,
    totalAmount: null,
    additionalIncomeDetailSubmitButtonEnable: false,
};

export default function guarantorAdditionalIncomeDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_FIXED_ALLOWANCE:
            return {
                ...state,
                fixedAllowance: addCommas(action.fixedAllowance),
            };

        case GUARANTOR_NON_FIXED_AALOWANCE:
            return {
                ...state,
                nonFixedAllowance: addCommas(action.nonFixedAllowance),
            };

        case GUARANTOR_EPF_DIVIDEND:
            return {
                ...state,
                epfDividend: addCommas(action.epfDividend),
            };

        case GUARANTOR_COMMISSION:
            return {
                ...state,
                commission: addCommas(action.commission),
            };

        case GUARANTOR_HOUSEHOLD_INCOME:
            return {
                ...state,
                householdIncome: addCommas(action.householdIncome),
            };

        case GUARANTOR_BONUS_TYPE:
            return {
                ...state,
                bonusType: action.bonusType,
            };

        case GUARANTOR_ANNUAL_BONUS_AMOUNT:
            return {
                ...state,
                annualBonusAmount: addCommas(action.annualBonusAmount),
            };

        case GUARANTOR_TOTAL_AMOUNT:
            return {
                ...state,
                totalAmount: numeral(totalAmount(state)).format(",0.00"),
            };

        case GUARANTOR_ADDITIONAL_INCOME_DEATAIL_SUBMIT_BUTTON_ENABLE:
            return {
                ...state,
                additionalIncomeDetailSubmitButtonEnable:
                    checkAdditionaIncomeDetailsSubmitBottonEnable(state),
            };

        case GUARANTOR_ADDITIONAL_INCOME_DETAILS_CLEAR:
            return {
                ...state,
                fixedAllowance: null,
                nonFixedAllowance: null,
                epfDividend: null,
                commission: null,
                householdIncome: null,
                bonusType: null,
                annualBonusAmount: null,
                totalAmount: null,
                additionalIncomeDetailSubmitButtonEnable: false,
            };

        default:
            return state;
    }
}

export const checkAdditionaIncomeDetailsSubmitBottonEnable = (state) => {
    return (
        state.fixedAllowance?.trim()?.length > 0 &&
        state.nonFixedAllowance?.trim()?.length > 0 &&
        state.epfDividend?.trim()?.length > 0 &&
        state.commission?.trim()?.length > 0 &&
        state.householdIncome?.trim()?.length > 0 &&
        state.bonusType &&
        state.annualBonusAmount?.trim()?.length > 0
    );
};

export const totalAmount = (state) => {
    return (
        (state.fixedAllowance ? removeCommas(state.fixedAllowance) : 0) +
        (state.nonFixedAllowance ? removeCommas(state.nonFixedAllowance) : 0) +
        (state.epfDividend ? removeCommas(state.epfDividend) : 0) +
        (state.commission ? removeCommas(state.commission) : 0) +
        (state.householdIncome ? removeCommas(state.householdIncome) : 0) +
        (state.annualBonusAmount ? removeCommas(state.annualBonusAmount) : 0)
    );
};
