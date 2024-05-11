import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Circle, View, XStack } from 'tamagui';
import { Container } from '~/tamagui.config';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons/faAngleDoubleLeft';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useGetDeviceAudioFiles } from '~/hooks/useGetDeviceAudioFiles';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import { getRandomColor } from '~/utils';

export default function Details() {
  const { trackName, uri, trackIdx }: { trackName?: string; uri?: string; trackIdx?: string } =
    useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(trackIdx ? +trackIdx : 0);

  const { audioFiles } = useGetDeviceAudioFiles();

  const leftColor = useSharedValue('red');
  const rightColor = useSharedValue('blue');

  const colors = useDerivedValue(() => {
    return [leftColor.value, rightColor.value];
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playSound(uri: string) {
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: uri }, { shouldPlay: true });
    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status: any) => {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
    });
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      leftColor.value = withTiming(getRandomColor());
      rightColor.value = withTiming(getRandomColor());
    }, 5000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioFiles.length > 0) {
      playSound(audioFiles[currentTrackIndex].uri);
    }
  }, [audioFiles, currentTrackIndex]);

  const togglePlayback = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (currentTrackIndex < audioFiles.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: audioFiles[currentTrackIndex]?.filename || 'Unknown Track',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#3e3194' },
          contentStyle: { backgroundColor: '#0a071e' },
        }}
      />
      <Container>
        <XStack ai="center" jc="center" mt={20} position="relative">
          <Canvas style={{ height: 300, width: 300 }}>
            <Rect x={0} y={0} width={300} height={300}>
              <LinearGradient start={vec(0, 0)} end={vec(300, 300)} colors={colors} />
            </Rect>
          </Canvas>
          <View position="absolute">
            <FontAwesomeIcon size={50} icon={faMusic} color="#fff" />
          </View>
        </XStack>
        <Slider
          style={{ width: '100%', height: 40, marginTop: 20 }}
          minimumValue={0}
          maximumValue={duration || 0}
          value={position || 0}
          minimumTrackTintColor="#3e3194"
          maximumTrackTintColor="#fff"
          thumbTintColor="#fff"
          onSlidingComplete={async (value) => {
            if (sound) {
              await sound.setPositionAsync(value);
            }
          }}
        />
        <XStack ai="center" jc="center" columnGap={15}>
          <Circle
            size={50}
            backgroundColor="#3e3194"
            pressStyle={{ backgroundColor: '#362a81' }}
            elevation="$4"
            onPress={prevTrack}>
            <FontAwesomeIcon icon={faAngleDoubleLeft} color="#fff" />
          </Circle>
          <Circle
            size={80}
            onPress={togglePlayback}
            pressStyle={{ backgroundColor: '#362a81' }}
            backgroundColor="#3e3194"
            elevation="$4">
            <FontAwesomeIcon icon={isPlaying ? faStop : faPlay} color="#fff" />
          </Circle>
          <Circle
            size={50}
            backgroundColor="#3e3194"
            pressStyle={{ backgroundColor: '#362a81' }}
            elevation="$4"
            onPress={nextTrack}>
            <FontAwesomeIcon icon={faAngleDoubleRight} color="#fff" />
          </Circle>
        </XStack>
      </Container>
    </>
  );
}
