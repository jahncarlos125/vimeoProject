import React, {useState} from 'react';
import {Text} from 'react-native';
import {Card, Button, ProgressBar, Title, Paragraph} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import api from './services/api';
import RNFetchBlob from 'rn-fetch-blob';

const ACCESS_TOKEN = '4c71da67b2262bef6a0af1e150f8d1de';

let index = 0;
let slices = [];

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

  const getSlices = (size) => {
    let chunkSize = 50 * 1024 * 1024;
    let length = Math.round(size / chunkSize);
    let arrayOfChunks = [];

    var byteIndex = 0;
    for (let i = 0; i < length; i++) {
      let chunk = {};
      var byteEnd = Math.ceil((size / length) * (i + 1));
      chunk = {
        id: i,
        start: byteIndex,
        end: byteEnd,
      };
      arrayOfChunks.push(chunk);
      byteIndex += byteEnd - byteIndex;
    }
    return arrayOfChunks;
  };

  const prepareFile = async (uri, url, size) => {
    if (index === 0) {
      slices = getSlices(size);
    }
    uploadVimeo(
      uri,
      url,
      slices[index].start,
      slices[index].end,
      slices.length,
    );
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
      prepareFile(video.uri, data.upload.upload_link, video.size);
    } catch (error) {
      console.error(error.response);
    }
  };
  let accept = 0;
  const onProgress = (written, total) => {
    if (written === total) {
      console.log('E IGUALLL');
    }
    accept = Number(written) / Number(total);
    console.log(video.size);
    console.log(accept);
    setProgress({written: accept, total: video.size});
  };

  const uploadVimeo = async (uri, url, start, end, size) => {
    RNFetchBlob.fs
      .slice(uri, `${RNFetchBlob.fs.dirs.DocumentDir}/${index}.mp4`, start, end)
      .then((path) => {
        RNFetchBlob.fetch(
          'PATCH',
          url,
          {
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': '' + start,
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
            'Content-Type': 'application/offset+octet-stream',
            Authorization: `bearer ${ACCESS_TOKEN}`,
          },
          RNFetchBlob.wrap(path),
        )
          .uploadProgress((written, total) => onProgress(written, total))
          .then((resp) => {
            if (index < size) {
              index += 1;
              onProgress(end, end);
              prepareFile(uri, url, size);
              console.log(path);
            }
          })
          .catch((err) => {
            console.log(err);
          });
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
          {slices.map((item) => (
            <ProgressBar
              key={item.id.toString()}
              progress={progress ? progress.written / progress.total : 0}
              style={{marginVertical: 10, height: 10}}
            />
          ))}
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
