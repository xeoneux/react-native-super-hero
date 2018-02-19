import React from "react";
import { Text, View } from "react-native";
import ReactTestRenderer, { ReactTestRendererJSON } from "react-test-renderer";

import SuperHero from "../super-hero";

const imageUrl = "https://placeimg.com/640/480/any";
const overlayTpl = () => (
  <View>
    <Text>React Native Hero</Text>
    <Text>Testing!</Text>
  </View>
);

const helpers = {
  getHeroContent: (tree: ReactTestRendererJSON) =>
    tree.children![0].children![0],
  getHeroImage: (tree: ReactTestRendererJSON) => tree.children![1],
  overlay: {
    getHeroContent: (tree: ReactTestRendererJSON) =>
      tree.children![1].children![0],
    getHeroImage: (tree: ReactTestRendererJSON) => tree.children![2],
    getOverlay: (tree: ReactTestRendererJSON) => tree.children![0],
  },
};

test("MAIN: Render correctly and overlay contains correct content", () => {
  // Tree Render
  // <View>
  //    <ContentOverlay />
  //    <SwappableImageComponent />
  // </View>
  const tree = ReactTestRenderer.create(
    <SuperHero source={{ uri: imageUrl }} renderOverlay={overlayTpl} />,
  ).toJSON()!;

  // Contains only the overlay and the image
  const wrapper = tree.children!;
  expect(wrapper.length).toEqual(2);

  const contentWrapper = tree.children![0];
  expect(contentWrapper.props.style.zIndex).toEqual(2);
  expect(contentWrapper.props.style.position).toEqual("absolute");

  const heroContent = helpers.getHeroContent(tree);
  // Tree Render
  // 	<View>
  //    <Text>React Native Hero</Text>
  //    <Text>Testing!</Text>
  // </View>
  expect(heroContent.type).toBe("View");
  expect(heroContent.children!.length).toBe(2);
  expect(heroContent.children![0].type).toEqual("Text");

  const heroImage = helpers.getHeroImage(tree);
  expect(heroImage.type).toEqual("Image");
  expect(heroImage.props.source).toEqual({ uri: imageUrl });
  expect(heroImage.props.style.width).toBe("100%");
});

test("PROPS: Props.minHeight should override the height", () => {
  const tree = ReactTestRenderer.create(
    <SuperHero
      source={{ uri: imageUrl }}
      renderOverlay={overlayTpl}
      minHeight={1000}
    />,
  ).toJSON();

  const imageParent = helpers.getHeroImage(tree!);
  expect(imageParent.props.style.height).toBe(1000);
});

test("PROPS: Props.fullWidth should default to state updates", () => {
  const tree = ReactTestRenderer.create(
    <SuperHero
      source={{ uri: imageUrl }}
      renderOverlay={overlayTpl}
      fullWidth={false}
    />,
  ).toJSON();

  const imageParent = helpers.getHeroImage(tree!);
  expect(imageParent.props.style.fullWidth).toBeUndefined();
});

test("PROPS: Color overlay", () => {
  const tree = ReactTestRenderer.create(
    <SuperHero
      source={{ uri: imageUrl }}
      renderOverlay={overlayTpl}
      colorOverlay={"red"}
      colorOpacity={0.4}
    />,
  ).toJSON();

  const colorOverlay = helpers.overlay.getOverlay(tree!);
  const colorOverlayMainStyle = colorOverlay.props.style;
  expect(colorOverlayMainStyle.backgroundColor).toBe("red");
  // Needs to be 100%
  expect(colorOverlayMainStyle.width).toBe("100%");
  // Will inheriet on state change, so must not be defined
  expect(colorOverlayMainStyle.height).toBeUndefined();

  // Needs to be placed on top of content: z-1 + absolute
  expect(colorOverlay.props.style.zIndex).toBe(1);
  expect(colorOverlay.props.style.position).toBe("absolute");
});

test("FUNC: createPositionStyle should create a style", () => {
  expect(SuperHero.createPositionStyle(2)).toEqual({
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 2,
  });
});

test("SNAPSHOT: All functionality should match prev snapshot", () => {
  const overlayTxt = () => <Text>React Native Hero</Text>;
  const tree = ReactTestRenderer.create(
    <SuperHero
      source={{ uri: imageUrl }}
      renderOverlay={overlayTxt}
      colorOverlay={"red"}
      colorOpacity={0.4}
      fullWidth={false}
      minHeight={1000}
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
