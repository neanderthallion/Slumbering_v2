import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  height?: number;
  color?: string;
}

// slumbering-title.png is a 500x500 canvas with a lot of transparent padding
// -- the actual glyph only occupies a 344x80px region within it. These
// constants crop that region tightly by oversizing the image and offsetting
// it inside a clipped box, rather than shipping a separately-cropped asset.
const IMAGE_SIZE = 500;
const GLYPH_BOX = { x: 81, y: 206, w: 344, h: 80 };

/** The "Slumbering" script wordmark, cropped tight and tinted to match the current theme. */
export function SlumberingWordmark({ height = 38, color }: Props) {
  const { theme } = useTheme();
  const scale = height / GLYPH_BOX.h;
  const width = GLYPH_BOX.w * scale;
  const scaledImageSize = IMAGE_SIZE * scale;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Image
        source={require('../../assets/images/slumbering-title.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width: scaledImageSize,
          height: scaledImageSize,
          left: -GLYPH_BOX.x * scale,
          top: -GLYPH_BOX.y * scale,
          tintColor: color ?? theme.colors.textHi,
        }}
      />
    </View>
  );
}
