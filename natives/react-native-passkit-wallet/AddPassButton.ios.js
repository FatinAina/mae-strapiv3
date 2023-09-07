import PropTypes from "prop-types";
import * as React from "react";
import { requireNativeComponent, View, ViewPropTypes } from "react-native";

/**
 * @flow
 */
("use strict");

export class AddPassButton extends React.Component<*> {
    static propTypes = {
        ...(ViewPropTypes || View.propTypes),
        addPassButtonStyle: PropTypes.number,
        onPress: PropTypes.func,
    };

    componentDidMount(): void {}

    render(): React.Node {
        return <RNPKAddPassButton {...this.props} />;
    }
}

const RNPKAddPassButton = requireNativeComponent("RNPKAddPassButton", AddPassButton, {});
