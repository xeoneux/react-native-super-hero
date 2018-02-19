import React from "react";
import {
  Dimensions,
  Image,
  ImageResizeMode,
  ImageURISource,
  LayoutChangeEvent,
  ScaledSize,
  View,
  ViewStyle,
} from "react-native";

import Injector from "react-native-super-injector";

export interface ISuperHeroProps {
  colorOpacity?: number;
  colorOverlay?: string;
  customImageComponent?: React.ComponentType;
  customImageProps?: object;
  fullWidth?: boolean;
  minHeight?: number;
  renderOverlay?: () => JSX.Element;
  resizeMode?: ImageResizeMode;
  source?: ImageURISource;
}

export interface ISuperHeroState {
  height?: number;
  opacity?: number;
  resizeMode?: ImageResizeMode;
  source?: ImageURISource;
  width?: number;
}

export default class SuperHero extends React.Component<
  ISuperHeroProps,
  ISuperHeroState
> {
  public static defaultProps = {
    fullWidth: true,
  };

  public static createPositionStyle(zIndex = 1): ViewStyle {
    return {
      left: 0,
      position: "absolute",
      top: 0,
      zIndex,
    };
  }

  public static updateWidthState(
    component: React.Component,
    window: ScaledSize,
  ) {
    if (component) {
      component.setState({
        width: window.width,
      });
    }
  }

  constructor(props: ISuperHeroProps) {
    super(props);

    this.state = {
      height: this.props.minHeight || undefined,
      opacity: 0,
      resizeMode: this.props.resizeMode || "cover",
      source: this.props.source,
    };
  }

  public componentWillReceiveProps(nextProps: ISuperHeroProps) {
    if (nextProps.source !== this.props.source) {
      this.setState({ source: nextProps.source });
    }
  }

  public componentDidMount() {
    this.setState({ opacity: 1 });
  }

  public renderColorOverlay() {
    const overlayStyles: ViewStyle = {
      backgroundColor: this.props.colorOverlay || "transparent",
      height: this.state.height,
      opacity: this.props.colorOpacity || 0.3,
      width: "100%",
      ...SuperHero.createPositionStyle(1),
    };

    return this.props.colorOverlay ? <View style={overlayStyles} /> : null;
  }

  public renderHeroOverlay() {
    const transparentBg: ViewStyle = { backgroundColor: "transparent" };
    const contentStyles: ViewStyle = {
      ...transparentBg,
      ...SuperHero.createPositionStyle(2),
    };

    return this.props.renderOverlay ? (
      <View style={contentStyles} onLayout={this.updateViewHeight}>
        {this.props.renderOverlay()}
      </View>
    ) : null;
  }

  public render() {
    const imageProps = {
      resizeMode: this.state.resizeMode,
      source: this.state.source,
      style: {
        height: this.state.height,
        width: this.state.width || "100%",
      },
    };

    return (
      <View style={{ opacity: this.state.opacity, position: "relative" }}>
        {this.renderColorOverlay()}
        {this.renderHeroOverlay()}
        <Injector
          defaultComponent={Image}
          defaultProps={imageProps}
          injectant={this.props.customImageComponent}
          injectantProps={this.props.customImageProps}
        />
      </View>
    );
  }

  private updateViewHeight(event: LayoutChangeEvent) {
    const overlayHeight = event.nativeEvent.layout.height;

    if (this.props.minHeight) {
      return;
    }

    if (overlayHeight !== this.state.height) {
      this.setState({ height: overlayHeight });
    }

    // Initial width state set
    if (this.props.fullWidth === true && !this.state.width) {
      SuperHero.updateWidthState(this, Dimensions.get("window"));
      Dimensions.addEventListener("change", ({ window }) =>
        SuperHero.updateWidthState(this, window),
      );
    }
  }
}
