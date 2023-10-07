import React, {useEffect, useLayoutEffect, useState} from 'react';
import { StyleSheet, View, Image, Text, StatusBarStyle, StatusBar, ScrollView, Dimensions, FlatList, SectionList, ImageBackground, TouchableWithoutFeedback, Button, TouchableOpacity, ActivityIndicator, LogBox  } from 'react-native';
import { CurrentRenderContext, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CachedImage from 'expo-cached-image';
import { auth, db, storage } from '../../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { doc, getDoc } from 'firebase/firestore';

function MainScreen(props) {
    const navigation = useNavigation();
    StatusBar.setBarStyle('light-content', true);
    LogBox.ignoreAllLogs(); //Ignore all log notifications

    const user = auth.currentUser;
    const userRef = doc(db, "requests", user.uid);
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(undefined);
    const [friendVideo, setFriendVideo] = useState(undefined);
    const [imageCacheKey, setImageCacheKey] = useState(undefined);

    let key = 1;

    useEffect(() => {
        clearAsyncStorage = async() => {
            AsyncStorage.clear();
            console.log('cleared cache');
        }
        
        downloadImage();
        //getData('pic');
        //downloadVideo(user.uid);

        //getFriendPost();
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

    }, []);
    
    const [users, setUser] = useState([
        { userName: 'phildo', src: require("../testVideo/a188BxIXgdOXdH1nxwH6qpazxnG2.mov"), srcImg: require("../assets/allison.jpg"), key: '1' },
        { userName: 'allison', src: require("../testVideo/a188BxIXgdOXdH1nxwH6qpazxnG2.mov"), srcImg: require("../assets/phillip.png"), key: '2'},
        { userName: 'phildo', src: require("../testVideo/a188BxIXgdOXdH1nxwH6qpazxnG2.mov"), srcImg: require("../assets/allison.jpg"), key: '3'},
        { userName: 'allison', src: require("../testVideo/a188BxIXgdOXdH1nxwH6qpazxnG2.mov"), srcImg: require("../assets/phillip.png"), key: '4'},
        { userName: 'phildo', src: require("../testVideo/a188BxIXgdOXdH1nxwH6qpazxnG2.mov"), srcImg: require("../assets/allison.jpg"), key: '5'},
    ]);

    const Post = ({item}) => {
        return (
            <View style={styles.post}>
                <View style={styles.postInfo}>
                    <Image style={styles.icon} source={item.srcImg}/>
                    <View style={{paddingLeft: 10}}>
                        <Text style={{color: "white"}}>{item.userName}</Text>
                        <Text style={{color: "grey"}}>__ min late</Text>
                    </View>
                </View>
                
                {/* <Video
                        style={styles.video}
                        source={{uri: item.friendVideo}}
                        useNativeControls
                        resizeMode='contain'
                        playsInSilentLockedModeIOS ={ true }
                    /> */}
                
                <Video
                        style={styles.video}
                        source={ item.src }
                        useNativeControls
                        resizeMode='contain'
                        playsInSilentLockedModeIOS ={ true }
                    />
            </View>
        );
    };

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
                console.log("Data did not exist");
                if  (type == 'pic'){
                    console.log('Downloading picture');
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
                const value = await AsyncStorage.getItem(`${user.uid}-pic`);
                console.log(value);
            }

            //storeCacheKey();
        })
        .catch((error) => {
            // Handle any errors
        })
    };

    const downloadVideo = async (ID) => {getDownloadURL(ref(storage, `posts/${ID}.mov`))
        .then((url) => {
            if (ID == user.uid){
                setVideo(url);
                console.log("User's Video loaded");
            } else {
                setFriendVideo(url);
                console.log("User's friend loaded");
            }
        })
        .catch((error) => {
            // Handle any errors
            console.log("Video doesn't exist");
        })
    };

    const getFriendPost = async () => {
        const uids = await getDoc(userRef);

        // Get all of user's friends
        for (var uid of Object.keys(uids.data()["allFriends"])) {
            const friendInfo = await getDoc(doc(db, "users", uid));
            
            if (friendInfo.data()["posted"]){
                downloadVideo(uid);
                setUser([users, {userName: friendInfo.data()["username"], postVid: friendVideo, key: `${key}`}]);
                key += 1;
                console.log(users);
            } else {
                console.log(`${friendInfo.data()["username"]} has not posted`);
            }
        }
    }

    const renderListHeader = () => {
        return (
            <Video
                style={styles.video}
                source={{uri: video}}
                useNativeControls
                resizeMode='contain'
                playsInSilentLockedModeIOS ={ true }
            />
         );
     }

    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => {navigation.navigate('FriendScreen')}}>
                    <Image style={{width: 40, height: 40}} source={require("../assets/invert_people_icon.png")} />
                </TouchableOpacity>
                <Text style={{fontSize: 30, fontWeight: "bold", color: "white"}}>VlogNow.</Text>
                <TouchableOpacity onPress={() => {navigation.navigate('UserScreen')}}>
                    <CachedImage source={{ uri: `${image}` }} cacheKey={`${user.uid}-thumb`} // (required) -- key to store image locally
                        style={styles.userIcon} />
                    {/* <Image source={{uri: `${image}`}} style={styles.userIcon}/> */}
                </TouchableOpacity>
            </View>

            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                data={users}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => {
                    return <Post item={item} />;
                }}
                ListHeaderComponent={renderListHeader}
            />

            <TouchableWithoutFeedback onPress={() => {navigation.navigate('RecordScreen')}}>
                <Text style={styles.camButton}>RECORD</Text>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    camButton: {
        bottom: 0,
        color: "white",
        textAlign: "center",
        paddingTop: 10
    },
    icon: {
        width: 35, 
        height: 35, 
        borderRadius: 50
    },
    userIcon: {
        width: 35, 
        height: 35,
        borderRadius: 50,
    },
    navBar: {
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: "space-between",
        borderHeight: 0,
        backgroundColor: 'transparent',
    },
    page: {
        flex: 1,
        backgroundColor: "black",
    },
    post: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    postInfo: {
        paddingLeft: 10,
        paddingBottom: 10,
        flexDirection: "row",
    },
    postImage: {
        width: '100%', 
        height: 500,
        borderRadius: 10
    },
    video: {
        height: 300,
        alignSelf: 'stretch',
    },
})

export default MainScreen;