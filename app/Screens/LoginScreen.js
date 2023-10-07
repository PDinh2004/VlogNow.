import React, {useLayoutEffect, useState} from 'react';
import { KeyboardAvoidingView, StyleSheet, TextInput, View, Text, TouchableOpacity } from 'react-native';
import { CurrentRenderContext, useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { doc, setDoc } from "firebase/firestore"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function LoginScreen(props) {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(async userCredentials => {
                const user = userCredentials.user;
                console.log('Registered in with:', user.email);

                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, { userID: user.uid, email: user.email, password: password, profilePic: "", username: "", created: Date.now() });

                const userRef_r = doc(db, "requests", user.uid);
                await setDoc(userRef_r, {ownRequests: {}, friendRequests: {}, allFriends: {}});

                navigation.navigate('AdditionalInfoScreen');
            })
            .catch(error => alert(error.message))
    }

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('Logged in with:', user.email);

                navigation.navigate('MainPage');
            })
            .catch(error => {
                alert(error.message);
            })
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

        // const unsubscribe = auth.onAuthStateChanged( user => {
        //     if (user) {
        //         navigation.navigate('MainPage');
        //     }
        // })

        // return unsubscribe;
    }, []);

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress = {handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress = {handleSignUp}
                    style={[styles.button, styles.buttonOutline]}
                >
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
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
    buttonOutline: {
        backgroundColor: "black",
        marginTop: 5,
        borderColor: "white",
        borderWidth: 2,
    },
    buttonOutlineText: {
        color: "white",
        fontWeight: 700,
        fontSize: 17
    },
    buttonText: {
        color: "black",
        fontWeight: 700,
        fontSize: 17,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    input: {
        backgroundColor: "white",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
    },
    inputContainer: {
        width: "80%"
    },
})

export default LoginScreen;