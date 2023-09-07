import { combineReducers } from "redux";

import asbApplicationDetailsReducer from "@redux/reducers/ASBServices/asbApplicationDetailsReducer";
import asbBecomeAGuarantorReducer from "@redux/reducers/ASBServices/asbBecomeAGuarantorReducer";
import asbCheckEligibilityReducer from "@redux/reducers/ASBServices/asbCheckEligibilityReducer";
import asbDeclineBecomeAGuarantorReducer from "@redux/reducers/ASBServices/asbDeclineBecomeAGuarantorReducer";
import asbGuarantorGetDocumentReducer from "@redux/reducers/ASBServices/asbGuarantorGetDocumentReducer";
import asbGuarantorPrePostQualReducer from "@redux/reducers/ASBServices/asbGuarantorPrePostQualReducer";
import asbSendNotificationReducer from "@redux/reducers/ASBServices/asbSendNotificationReducer";
import asbUpdateCEPReducer from "@redux/reducers/ASBServices/asbUpdateCEPReducer";
import guarantorOTPReducer from "@redux/reducers/ASBServices/guarantorOTPReducer";
import masterDataReducer from "@redux/reducers/ASBServices/masterDataReducer";
import prePostQualReducer from "@redux/reducers/ASBServices/prePostQualReducer";

const asbServicesReducer = combineReducers({
    asbGuarantorPrePostQualReducer,
    asbUpdateCEPReducer,
    asbSendNotificationReducer,
    asbApplicationDetailsReducer,
    asbBecomeAGuarantorReducer,
    asbDeclineBecomeAGuarantorReducer,
    masterDataReducer,
    prePostQualReducer,
    asbCheckEligibilityReducer,
    guarantorOTPReducer,
    asbGuarantorGetDocumentReducer,
});

export default asbServicesReducer;
