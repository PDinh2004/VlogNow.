import React, {useLayoutEffect, useRef, useState} from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View, Button, TouchableOpacity } from 'react-native';
import { CurrentRenderContext, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import { auth, db, storage } from '../../firebase';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";

function RecordScreen(props) {
    const navigation = useNavigation();
    let cameraRef = useRef();
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [recording, setRecording] = useState(false);
    const [video, setVideo] = useState(undefined);

    const user = auth.currentUser;
    const users = collection(db, "users");
    const userRef = doc(db, "users", user.uid);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

        (async () => {
            const {status} = await Audio.requestPermissionsAsync();

            if (!permission) {
                // Camera permissions are still loading
                return <View />;
            }
        
            if (!permission.granted) {
                // Camera permissions are not granted yet
                return (
                  <View style={styles.container}>
                    <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                    <Button onPress={requestPermission} title="grant permission" />
                  </View>
                );
            }
        })();
    }, []);

    const getBlobFroUri = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        return blob;
    };

    let recordVideo = () => {
        setRecording(true);
        let options = {
            quality: "1080p",
            maxDuration: 5,
            mute: false,
        };

        cameraRef.current.recordAsync(options).then((recordedVideo) => {
            setVideo(recordedVideo);
            setRecording(false);
        })
    }

    let stopRecording = () => {
        setRecording(false);
        cameraRef.current.stopRecording();
    }

    const uploadVideo = async () => {
        const postVidRef = ref(storage, `posts/${user.uid}.mov`);
        const videoBlob = await getBlobFroUri(video.uri);

        uploadBytes(postVidRef, videoBlob, {contentType: "video/mov"}).then(async (snapshot) => {
            console.log('Uploaded a blob or file!');
            await updateDoc(userRef, { posted: true } );
            
            navigation.navigate('MainPage');
        });

    }

    if (video){
        return (
            <SafeAreaView style={styles.page}>
                <Video
                    style={styles.video}
                    source={{uri: video.uri}}
                    useNativeControls
                    resizeMode='contain'
                    isLooping
                />
                <Button title="Share" onPress={uploadVideo}/>
                <Button title="Discard" onPress={() => setVideo(undefined)} />
            </SafeAreaView>
        )
    }

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    return (
        <SafeAreaView style={{flexGrow: 1, backgroundColor: "grey"}}>
            <View style={styles.container}>
                <Camera style={styles.camera} type={type} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                        <MaterialIcons name="flip-camera-ios" size={40} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={recording ? stopRecording : recordVideo}>
                        <Text style={{color: recording ? "red" : "white", fontSize: 40}}>Record</Text>
                    </TouchableOpacity>
                    </View>
                </Camera>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    page: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black'
    },
    video: {
        flex: 1,
        alignSelf: 'stretch'
    },
})

export default RecordScreen;