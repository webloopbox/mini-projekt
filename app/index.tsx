import { Stack } from 'expo-router';
import { ScrollView } from 'tamagui';
import { MusicCard } from '~/components/MusicCard';
import { LogBox } from 'react-native';
import { useGetDeviceAudioFiles } from '~/hooks/useGetDeviceAudioFiles';

LogBox.ignoreAllLogs();

export default function Home() {
  const { audioFiles } = useGetDeviceAudioFiles();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tracks',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#3e3194' },
          contentStyle: { backgroundColor: '#0a071e' },
        }}
      />
      <ScrollView w={'100%'} contentContainerStyle={{ paddingBottom: 20 }}>
        {audioFiles.map((audioFile, index) => (
          <MusicCard key={index} audioFile={audioFile} trackIdx={index} />
        ))}
      </ScrollView>
    </>
  );
}
