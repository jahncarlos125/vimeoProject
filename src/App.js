import React, {useState} from 'react';
import {Text} from 'react-native';
import {Card, Button} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import api from './services/api';

const ACCESS_TOKEN = '4c71da67b2262bef6a0af1e150f8d1de';

const vimeoProject = () => {
  const [video, setVideo] = useState({
    uri: '',
    size: 0,
    mime: '',
  });

  const getVideo = async () => {
    try {
      const {path, size, mime} = await ImagePicker.openPicker({
        mediaType: 'video',
      });

      setVideo({
        uri: path,
        size,
        mime,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createVideo = async () => {
    let body = {
      name: 'Teste Vimeo',
      upload: {
        approach: 'tus',
        size: video.size,
      },
    };
    try {
      const {data} = await api.post('me/videos', JSON.stringify(body), {
        headers: {
          Authorization: `bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });
      setVideo({
        ...video,
        url: data.upload.upload_link,
      });
    } catch (error) {
      console.error(error.response);
    }
  };
  return (
    <Card
      title="Upload with Vimeo"
      image={{uri: video.uri || 'https://placeimg.com/640/480/tech'}}>
      <Button
        title="Select Video"
        type="outline"
        raised
        onPress={getVideo}
        containerStyle={{marginBottom: 10}}
      />
      <Button title="Upload Video" onPress={createVideo} />
      {video.url && <Text>{video.url}</Text>}
    </Card>
  );
};

export default vimeoProject;
