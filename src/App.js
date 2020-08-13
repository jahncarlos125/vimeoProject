import React, {useState} from 'react';
import {Text} from 'react-native';
import {Card, Button, ProgressBar, Title, Paragraph} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import api from './services/api';
import RNFetchBlob from 'rn-fetch-blob';

const ACCESS_TOKEN = '4c71da67b2262bef6a0af1e150f8d1de';

const vimeoProject = () => {
  const [video, setVideo] = useState({});
  const [progress, setProgress] = useState({
    written: 0,
    total: 0,
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
      uploadVimeo(video.uri, data.upload.upload_link);
    } catch (error) {
      console.error(error.response);
    }
  };

  const uploadVimeo = (uri, url) => {
    RNFetchBlob.fetch(
      'PATCH',
      url,
      {
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': '0',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
        'Content-Type': 'application/offset+octet-stream',
        Authorization: `bearer ${ACCESS_TOKEN}`,
      },
      RNFetchBlob.wrap(uri),
    )
      .uploadProgress((written, total) => {
        setProgress({written, total});
      })
      .then((resp) => {
        setProgress({written: 1, total: 1});
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Card>
      <Card.Title title="Upload to Vimeo with TUS" />
      <Card.Cover
        source={{uri: video.uri || 'https://placeimg.com/640/480/tech'}}
      />
      {video.uri && (
        <Card.Content>
          <Title>Video</Title>
          <ProgressBar
            progress={progress ? progress.written / progress.total : 0}
            style={{marginVertical: 10, height: 10}}
          />
        </Card.Content>
      )}
      <Card.Actions>
        <Button onPress={getVideo}>Select Video</Button>
        <Button onPress={createVideo}>Upload Video</Button>
      </Card.Actions>
    </Card>
  );
};

export default vimeoProject;
