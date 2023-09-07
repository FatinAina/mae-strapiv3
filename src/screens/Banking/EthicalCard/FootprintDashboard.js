import PropTypes from "prop-types";
import React from "react";

import ExpensesDashboardScreen from "@screens/Tracker/ExpensesDashboardScreen";

function FootprintDashboard({ navigation, route }) {
    return (
        <ExpensesDashboardScreen
            navigation={navigation}
            route={route}
            isFootprintDashboard={true}
        />
    );
}

FootprintDashboard.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default React.memo(FootprintDashboard);
