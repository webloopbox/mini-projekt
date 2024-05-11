import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';

export const useGetDeviceAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const { assets } = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
        });
        setAudioFiles(assets);
      }
    })();
  }, []);

  return { audioFiles };
};
