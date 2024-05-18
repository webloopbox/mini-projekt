import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Circle, Text, View, XStack } from 'tamagui';
import { Container } from '~/tamagui.config';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons/faVolumeHigh';
import { faRepeat } from '@fortawesome/free-solid-svg-icons/faRepeat';
import { faVolumeMute } from '@fortawesome/free-solid-svg-icons/faVolumeMute';
import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons/faAngleDoubleLeft';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useGetDeviceAudioFiles } from '~/hooks/useGetDeviceAudioFiles';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import { getRandomColor } from '~/utils';
import { ActivityIndicator } from 'react-native';

export default function Details() {
  const { trackName, uri, trackIdx }: { trackName?: string; uri?: string; trackIdx?: string } =
    useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(trackIdx ? +trackIdx : 0);
  const [volume, setVolume] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
      setProgress(status.positionMillis / status.durationMillis);
    });
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      leftColor.value = withTiming(getRandomColor());
      rightColor.value = withTiming(getRandomColor());
    }, 3000);

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

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
        <XStack ai="center" jc="center" columnGap={2}>
          {position === null || duration === null ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <Text color="#fff">
              {formatTime(position || 0)} / {formatTime(duration || 0)}
            </Text>
          )}
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={0}
            maximumValue={duration || 0}
            value={position || 0}
            minimumTrackTintColor="rgb(255, 255, 255)"
            maximumTrackTintColor="#fff"
            thumbTintColor="#fff"
            onSlidingComplete={async (value) => {
              if (sound) {
                await sound.setPositionAsync(value);
              }
            }}
          />
        </XStack>
        <XStack ai="center" jc="center" columnGap={25}>
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
        <XStack ai="center" jc="center">
          <Circle
            size={50}
            backgroundColor="#3e3194"
            pressStyle={{ backgroundColor: '#362a81' }}
            elevation="$4"
            onPress={async () => {
              if (sound) {
                await sound.setIsMutedAsync(!isMuted);
                setIsMuted(!isMuted);
              }
            }}>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} color="#fff" />
          </Circle>
          <Slider
            style={{ width: '50%', height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor="#3e3194"
            maximumTrackTintColor="#fff"
            thumbTintColor="#fff"
            onValueChange={async (value) => {
              if (sound) {
                await sound.setVolumeAsync(value);
                setVolume(value);
              }
            }}
          />
        </XStack>
      </Container>
    </>
  );
}
