import React, {useLayoutEffect} from 'react';
import { Image, ImageBackground, StyleSheet, View, Text, TouchableHighlight } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function WelcomeScreen(props) {
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    return (
        <View 
            style = {styles.background}
        >
            <View style={styles.logoContainer}>
                <Text style={styles.logo}>VlogNow.</Text>
                <Text style={styles.logoCaption}>Capturing life through video</Text>
            </View>

            <TouchableHighlight style={styles.loginButton} onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={{color: "black", fontSize: 30}}>Login</Text>
            </TouchableHighlight>

            <TouchableHighlight style={styles.registerButton} onPress={() => navigation.navigate('AdditionalInfoScreen')}>
                <Text style={{color: "white", fontSize: 30}}>Register</Text>
            </TouchableHighlight>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "black"
    },
    logo: {
        fontSize: 50,
        color: "white",
    },
    logoCaption: {
        fontSize: 20,
        color: "white"
    },
    logoContainer: {
        position: "absolute",
        top: 70,
        alignItems: "center",
    },
    loginButton: {
        width: '100%',
        height: 70,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    registerButton: {
        width: '100%',
        height: 70,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
})

export default WelcomeScreen;