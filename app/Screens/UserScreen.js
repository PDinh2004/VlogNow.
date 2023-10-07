import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ActivityIndicator, LogBox } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db, storage } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from 'firebase/storage';
import CachedImage from 'expo-cached-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

//import FastImage from 'react-native-fast-image'

function UserScreen(props) {
    const navigation = useNavigation();
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState('');
    const [imageCacheKey, setImageCacheKey] = useState(undefined);

    useEffect(() => {
        const getUsername = async () => {
            const docSnap = await getDoc(userRef);
            setUsername(docSnap.data().username, console.log(username));
        }

        LogBox.ignoreAllLogs();//Ignore all log notifications
        
        if (username == ''){
            getUsername();
        }

        // downloadImage();
        // getData('pic');
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

    }, []);

    const handleSignOut = () => {
        auth
            .signOut()
            .then(() => {
                navigation.replace("Login");
            })
            .catch(error => {alert(error.message)})
    }

    const getData = async (type) => {
        try {
            const value = await AsyncStorage.getItem(`${user.uid}-${type}`);
            if (value !== null) {
                // value previously stored
                if (type == 'pic'){
                    setImageCacheKey(value);
                    console.log(value);
                }
            } else {
                if  (type == 'pic'){
                    downloadImage();
                }
            }
        } catch (e) {
          // error reading value
        }
    };

    const downloadImage = async () => {getDownloadURL(ref(storage, `profilePics/${user.uid}.png`))
        .then((url) => {
            console.log(url);
            setImage(url);

            const storeCacheKey = async () => {
                await AsyncStorage.setItem(`${user.uid}-pic`, `profilePic`);
            }

            //storeCacheKey();
        })
        .catch((error) => {
            // Handle any errors
        })
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => {navigation.navigate('MainPage')}} >
                    <Image style={{width: 40, height: 40}} source={require("../assets/white_back_arrow.jpg")}/>
                </TouchableOpacity>
                
                <Text style={{fontSize: 30, fontWeight: "bold", color: "white"}}>Profile</Text>
                <Image style={{width: 40, height: 40}} source={require("../assets/white_back_arrow.jpg")} />
            </View>

            <View style={styles.info}>
                <CachedImage source={{ uri: `${image}` }} cacheKey={`${user.uid}-thumb`} // (required) -- key to store image locally
style={styles.image} />
                {/* <Image source={{uri: `${image}`}} style={styles.image}/> */}
                <Text style={styles.email}>{username}</Text>
                <Text style={styles.email}>{auth.currentUser?.email}</Text>
            </View>

            <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    email: {
        color: "white",
        fontSize: 24
    },
    image: {
        height: 150,
        width: 150,
        borderRadius: 100
    },
    info: {
        alignItems: 'center'
    },
    navBar: {
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: "space-between",
        borderHeight: 0,
        componentBackgroundColor: 'transparent',
    },
    page: {
        flex: 1,
        backgroundColor: "black",
    },
    signOut: {
        backgroudColor: "white",
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 50,
    },
    signOutText: {
        color: "black",
        fontSize: 24,
    },
})

export default UserScreen;