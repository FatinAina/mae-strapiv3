import {
    IS_PM1_ACTION,
    IS_PMA_ACTION,
    IS_ZEST_ACTION,
    ENTRY_CLEAR,
    IS_KAWANKU_SAVINGS_ACTION,
    IS_KAWANKU_SAVINGS_I_ACTION,
    IS_CASA_STP_ACTION,
    IS_PRODUCT_TILE_ACTION,
    IS_PRODUCT_NAME_ACTION,
} from "@redux/actions/ZestCASA/entryAction";

const initialState = {
    isZest: null,
    isPM1: null,
    isPMA: null,
    isKawanku: null,
    isKawankuSavingsI: null,
    productTile: null,
    isCASASTP: null,
    productName: null,
};

export default function entryReducer(state = initialState, action) {
    switch (action.type) {
        case IS_ZEST_ACTION:
            return {
                ...state,
                isZest: action.isZest,
            };

        case IS_PM1_ACTION:
            return {
                ...state,
                isPM1: action.isPM1,
            };

        case IS_PMA_ACTION:
            return {
                ...state,
                isPMA: action.isPMA,
            };

        case IS_KAWANKU_SAVINGS_ACTION:
            return {
                ...state,
                isKawanku: action.isKawanku,
            };
        case IS_KAWANKU_SAVINGS_I_ACTION:
            return {
                ...state,
                isKawankuSavingsI: action.isKawankuSavingsI,
            };

        case IS_CASA_STP_ACTION:
            return {
                ...state,
                isCASASTP: action.isCASASTP,
            };

        case IS_PRODUCT_TILE_ACTION:
            return {
                ...state,
                productTile: action.productTile,
            };

        case IS_PRODUCT_NAME_ACTION:
            return {
                ...state,
                productName: action.productName,
            };

        case ENTRY_CLEAR:
            return {
                ...state,
                isZest: null,
                isPM1: null,
                isPMA: null,
                isKawanku: null,
                isKawankuSavingsI: null,
                productTile: null,
                isCASASTP: null,
                productName: null,
            };

        default:
            return state;
    }
}
