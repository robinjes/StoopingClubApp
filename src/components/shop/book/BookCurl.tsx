import {
  Canvas,
  Fill,
  Group,
  Image,
  ImageShader,
  LinearGradient,
  Rect,
  Skia,
  rrect,
  rect,
  useImage,
  Vertices,
  vec,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import {
  CURL_MESH_COLS,
  CURL_MESH_ROWS,
  PAGE_IMAGE_HEIGHT_RATIO,
  PAPER_BACK,
} from './bookConstants';
import { buildPageMeshTopology, deformPagePoint, getFoldLineX } from './bookMath';
import BookShadow from './BookShadow';
import type { BookFlipSession } from './bookTypes';

type BookCurlProps = {
  width: number;
  height: number;
  progress: SharedValue<number>;
  session: BookFlipSession;
  paperColor: string;
};

function buildFullPageVertices(
  width: number,
  height: number,
  progress: number,
  direction: BookFlipSession['direction'],
  meshCols: number,
  meshRows: number,
  vertexCount: number,
) {
  'worklet';
  const points = [];

  for (let index = 0; index < vertexCount; index += 1) {
    const col = index % meshCols;
    const row = Math.floor(index / meshCols);
    const srcX = (col / (meshCols - 1)) * width;
    const srcY = (row / (meshRows - 1)) * height;
    const deformed = deformPagePoint(srcX, srcY, width, progress, direction, height);
    points.push(Skia.Point(deformed.x, deformed.y));
  }

  return points;
}

/**
 * Skia renderer for the deformed turning page and flat reveal page.
 * When a page snapshot is available the entire sheet (image + text) curls as one texture.
 */
export default function BookCurl({ width, height, progress, session, paperColor }: BookCurlProps) {
  const imageHeight = height * PAGE_IMAGE_HEIGHT_RATIO;
  const direction = session.direction;
  const turningImage = useImage(session.turningImageUrl);
  const revealImage = useImage(session.revealImageUrl);

  const pageClip = useMemo(() => rrect(rect(0, 0, width, height), 8, 8), [height, width]);

  const topology = useMemo(
    () => buildPageMeshTopology(CURL_MESH_COLS, CURL_MESH_ROWS, width, height),
    [height, width],
  );

  const texturePoints = useMemo(
    () => topology.textures.map((point) => Skia.Point(point.x, point.y)),
    [topology.textures],
  );

  const meshVertices = useDerivedValue(() =>
    buildFullPageVertices(
      width,
      height,
      progress.value,
      direction,
      CURL_MESH_COLS,
      CURL_MESH_ROWS,
      topology.vertexCount,
    ),
  );

  const foldX = useDerivedValue(() => getFoldLineX(width, progress.value, direction));

  const thicknessX = useDerivedValue(() => {
    const fold = getFoldLineX(width, progress.value, direction);
    return direction === 'forward' ? fold : fold - 3;
  });

  const thicknessOpacity = useDerivedValue(() => (progress.value > 0.02 ? 0.85 : 0));

  const highlightOpacity = useDerivedValue(() => Math.min(progress.value * 0.75, 0.45));

  const turningUsesSnapshot = session.turningPageSnapshot !== null;
  const revealUsesSnapshot = session.revealPageSnapshot !== null;

  return (
    <View style={styles.canvasHost} pointerEvents="none">
      <Canvas style={{ width, height }}>
        <Group clip={pageClip}>
          <Fill color={paperColor} />

          {/* Reveal page underneath */}
          {revealUsesSnapshot ? (
            <Image image={session.revealPageSnapshot} x={0} y={0} width={width} height={height} fit="fill" />
          ) : (
            <Group>
              {revealImage ? (
                <Image image={revealImage} x={0} y={0} width={width} height={imageHeight} fit="cover" />
              ) : (
                <Rect x={0} y={0} width={width} height={imageHeight} color="#D9D9D9" />
              )}
              <Rect x={0} y={imageHeight} width={width} height={height - imageHeight} color={paperColor} />
            </Group>
          )}

          <BookShadow width={width} height={height} progress={progress} direction={direction} />

          {/* Turning page — full snapshot preferred so image stays on the sheet */}
          {turningUsesSnapshot ? (
            <Vertices
              vertices={meshVertices}
              textures={texturePoints}
              indices={topology.indices}
              mode="triangles"
            >
              <ImageShader
                image={session.turningPageSnapshot}
                tx="clamp"
                ty="clamp"
                fit="fill"
                rect={{ x: 0, y: 0, width, height }}
              />
            </Vertices>
          ) : turningImage ? (
            <Vertices
              vertices={meshVertices}
              textures={texturePoints}
              indices={topology.indices}
              mode="triangles"
            >
              <ImageShader
                image={turningImage}
                tx="clamp"
                ty="clamp"
                fit="cover"
                rect={{ x: 0, y: 0, width, height: imageHeight }}
              />
            </Vertices>
          ) : (
            <Vertices
              vertices={meshVertices}
              textures={texturePoints}
              indices={topology.indices}
              mode="triangles"
            >
              <Fill color={paperColor} />
            </Vertices>
          )}

          <Rect x={foldX} y={0} width={3} height={height} opacity={highlightOpacity}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(3, 0)}
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
            />
          </Rect>

          <Rect x={thicknessX} y={4} width={3} height={height - 8} color={PAPER_BACK} opacity={thicknessOpacity} />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
