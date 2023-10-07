import { useNavigation } from '@react-navigation/native';
import React, { useState, useLayoutEffect } from 'react';
import { SafeAreaView, Text, TextInput, StyleSheet, Button, Image, View, Platform, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function AdditionalInfoScreen(props) {
    const navigation = useNavigation();

    const user = auth.currentUser;
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('');
    const [image, setImage] = useState(null);
    const users = collection(db, "users");
    const userRef = doc(db, "users", user.uid);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

    }, []);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        
        if (!result.canceled) {
            const picImagesRef = ref(storage, `profilePics/${user.uid}.png`);
            const imageBlob = await getBlobFroUri(result.assets[0].uri);
    
            uploadBytes(picImagesRef, imageBlob, {contentType: "image/png"}).then((snapshot) => {
                console.log('Uploaded a blob or file!');
            });
            
            await updateDoc(userRef, { profilePic: `image/${user.uid}.png` } );

            setImage(result.assets[0].uri);
        }
    };

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

    const checkUsername = async () => {
        const userCheck = query(users, where("username", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(userCheck);
        if (!querySnapshot.empty){
            setStatus('This username is not available. Enter a new one.');
        } else {
            setStatus('');
            await updateDoc(userRef, { username: username } );
        }
    }

    const moveOn = () => {
        if (status == '' && username != '' && image != null){
            navigation.navigate('MainPage');
        } else {
            alert('Please complete all required fields to proceed.');
        }
    }

    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.navBar}>
                <Image style={styles.backButton} source={require("../assets/white_back_arrow.jpg")} />
                <Text style={styles.title}>Additional Info</Text>
            </View>

            <View style={styles.inputContainer} >
                <Text style={{color: 'white', fontSize: 24, paddingBottom: 10}}> Enter Username </Text>

                <TextInput 
                    placeholder='Enter Username'
                    value={username}
                    onChangeText={text => setUsername(text)}
                    style={styles.input}
                    onSubmitEditing={checkUsername}
                />
                
                <Text style={styles.status}>{status}</Text>
            </View>

            <View style={styles.imageContainer}>
                <Text style={styles.picText}>Set Profile Picture</Text>
                <Button title="Select from photo album" onPress={pickImage} />
                {image && <Image source={{ uri: image }} style={styles.image} />}
            </View>

            <TouchableOpacity style={styles.buttonContainer} onPress={moveOn}>
                <Text style={styles.button}>Submit</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
    },
    button: {
        color: 'black',
        fontSize: 30,
    },
    buttonContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    input: {
        backgroundColor: 'white',
        width: '80%',
        padding: 5,
    },
    inputContainer: {
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        top: '3%'
    },
    imageContainer: {
        paddingVertical: 10,
        alignItems: 'center',
        height: '63%',
        top: '10%'
    },
    navBar: {
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10,
        componentBackgroundColor: 'transparent',
    },
    page: {
        flex: 1,
        backgroundColor: 'black'
    },
    picText: {
        color: 'white',
        fontSize: 24
    },
    status: {
        color: 'red', 
        fontSize: 17,
        width: '80%',
        paddingTop: 10
    },
    title: {
        fontSize: 30, 
        fontWeight: "bold", 
        color: "white",
        left: 40
    },
})

export default AdditionalInfoScreen;