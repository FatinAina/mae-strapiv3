const initialState = {
    stpAdditionalDetails: null,
};

export default function additionalDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case "ADDITIONAL_DETAILS_SUCCESS":
            return {
                ...state,
                stpAdditionalDetails: action.data,
            };

        case "ADDITIONAL_DETIALS_CLEAR":
            return {
                ...state,
                stpAdditionalDetails: null,
            };

        default:
            return state;
    }
}
