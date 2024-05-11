import { View, Text, XStack } from 'tamagui';
import { Link } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons/faArrowCircleRight';
import { Asset } from 'expo-media-library';

export const MusicCard = ({ audioFile, trackIdx }: { audioFile: Asset; trackIdx: number }) => {
  return (
    <Link
      href={{
        pathname: '/details',
        params: { trackName: audioFile.filename, uri: audioFile.uri, trackIdx },
      }}
      asChild>
      <View
        bg="#282153"
        mx={20}
        mt={20}
        borderRadius="$4"
        pressStyle={{ backgroundColor: '#3d347c' }}>
        <XStack ai="center" p={20}>
          <XStack ai="center" flex={1}>
            <FontAwesomeIcon icon={faMusic} color="#fff" />
            <Text fontWeight="bold" color={'#fff'} ml={15}>
              {audioFile.filename}
            </Text>
          </XStack>
          <FontAwesomeIcon icon={faArrowCircleRight} color="#fff" />
        </XStack>
      </View>
    </Link>
  );
};
