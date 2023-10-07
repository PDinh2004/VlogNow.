import React, {useEffect, useLayoutEffect, useState} from 'react';
import { SafeAreaView, TextInput, View, StyleSheet, Image, TouchableOpacity, Text, FlatList } from 'react-native';
import { CurrentRenderContext, NavigationContainer, TabActions, useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { collection, doc, query, setDoc, where, getDocs, arrayUnion, updateDoc, getDoc, FieldValue, deleteField } from "firebase/firestore";
import { SceneMap, TabView } from 'react-native-tab-view';

function FriendScreen(props) {
    const navigation = useNavigation();
    const [friendID, setFriendID] = useState('');
    const user = auth.currentUser;
    const users = collection(db, "users");

    const [friendR, setFriendR] = useState([]);

    useEffect(() => {
        // Better idea store them into local array and delete from array
        getFriendReq();
        
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
        
    }, []);

    const getFriendReq = () => {
        const userDB = doc(db, 'requests', user.uid);
        getDoc(userDB).then((doc) => {
            setFriendR(Object.values(doc.data().friendRequests))
        })
    }

    const handleFriendSearch = async () => {
        const friend = query(users, where("email", "==", friendID.toLowerCase()));
        const querySnapshot = await getDocs(friend);
        let ID = 0;
        let friendEmail = "";

        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data().userID);
            ID = doc.data().userID;
            friendEmail = doc.data().email;
        });

        // Updates "friend" request list
        const friendRef = doc(db, 'requests', ID);
        await updateDoc(friendRef, {
            [`friendRequests.${user.uid}`]: {useremail: user?.email}
        });

        // Updates current user's own request list
        await updateDoc(doc(db, 'requests', user.uid), {
            ownRequests: { [ID]: {useremail: friendEmail} }
        });
    };

    const addFriend = async (id) => {
        const friend = query(users, where("email", "==", id.toLowerCase()));
        const querySnapshot = await getDocs(friend);
        let ID = 0;
        let friendEmail = "";

        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data().userID);
            ID = doc.data().userID;
            friendEmail = doc.data().email;
        });

        // Remove "friend" from user's friend request list - source: {https://www.appsloveworld.com/react-native/100/125/delete-nested-field-in-firestore}
        await updateDoc(doc(db, 'requests', user.uid), {
            [`friendRequests.${ID}`]: deleteField()
        });

        // Remove user from "friend"'s own request list
        await updateDoc(doc(db, 'requests', ID), {
            [`ownRequests.${user.uid}`]: deleteField()
        });

        // Add "friend" to user's allFriends list
        await updateDoc(doc(db, 'requests', user.uid), {
            [`allFriends.${ID}`]: {
                useremail: id
            }
        });

        // Add user to "friend"'s allFriends list
        await updateDoc(doc(db, 'requests', ID), {
            [`allFriends.${user.uid}`]: {
                useremail: id
            }
        });

        // Refer to note above in useEffect
        getFriendReq();
    }



    const removeFriend = async (id) => {
        const friend = query(users, where("email", "==", id.toLowerCase()));
        const querySnapshot = await getDocs(friend);
        let ID = 0;
        let friendEmail = "";

        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data().userID);
            ID = doc.data().userID;
            friendEmail = doc.data().email;
        });

        // Remove "friend" from user's friend request list - source: {https://www.appsloveworld.com/react-native/100/125/delete-nested-field-in-firestore}
        await updateDoc(doc(db, 'requests', user.uid), {
            [`friendRequests.${ID}`]: deleteField()
        });

        // Remove user from "friend"'s own request list
        await updateDoc(doc(db, 'requests', ID), {
            [`ownRequests.${user.uid}`]: deleteField()
        });

        // Refer to note above in useEffect
        getFriendReq();
    }

    const FriendRequests = ({item}) => {
        return (
            <View style={styles.friendRequestContainer}>
                <Text style={{color: 'white'}}>{item.useremail}</Text>

                <View style={styles.addRemoveButtons}>
                    <TouchableOpacity style={{backgroundColor: 'grey', borderRadius: 10, width: 50, alignItems: 'center'}} onPress={() => addFriend(item.useremail)}>
                        <Text style={styles.addButton}>Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.removeFriendButton} onPress={() => removeFriend(item.useremail)}>
                        <Image style={styles.removeFriend} source={require("../assets/close_icon.png")}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    
    const FirstRoute = () => (
        <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
    );
  
    const SecondRoute = () => (
        <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
    );

    return (
        <SafeAreaView style={styles.page}>
            <Text style={{fontSize: 30, fontWeight: "bold", color: "white", paddingBottom: 10}}>VlogNow.</Text>
            <View style={styles.inputContainer}>
                <Image style={styles.searchImg} source={require('../assets/magnifying_glass.png')} />
                <TextInput 
                    placeholder="Friend's Username/Email"
                    placeholderTextColor='grey'
                    value={friendID}
                    onChangeText={text => setFriendID(text)}
                    style={styles.input}
                />
            </View>

            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                data={friendR}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => {
                    return <FriendRequests item={item} />
                }}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress = {handleFriendSearch}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Send Friend Request</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    addRemoveButtons: {
        flexDirection: 'row'
    },
    button: {
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 10,
        width: "100%",
        padding: 15,
        alignItems: "center"
    },
    buttonContainer: { 
        width: "60%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    friendRequestContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 20,
        width: '80%',
        alignSelf: 'center',
    },
    input: {
        paddingLeft: 15
    },
    inputContainer: {
        flexDirection: 'row',
        width: "90%",
        position: 'relative',
        height: 50,
        backgroundColor: '#1D1C1E',
        borderRadius: 5,
        alignItems: 'center',
    },
    removeFriend: {
        width: 15,
        height: 15
    },
    removeFriendButton: {
        marginLeft: 15
    },
    page: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: "center",
    },
    searchImg: {
        width: 22,
        height: 22,
        left: 5
    },
})

export default FriendScreen;