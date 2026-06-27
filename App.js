import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import axios from 'axios';

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const cameraRef = useRef(null);

    useEffect(() => {
        speakWelcome();
    }, []);

    const speakWelcome = () => {
        Speech.speak('Minti est prêt.', {
            language: 'fr-FR',
            pitch: 1,
            rate: 1,
        });
    };

    const analyzeScene = async () => {
        try {
            if (!cameraRef.current) return;

            setIsLoading(true);
            setDescription("Analyse en cours...");

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.6,
                base64: Platform.OS === "web",
            });

            const formData = new FormData();

            if (Platform.OS === "web") {
                const response = await fetch(photo.uri);
                const blob = await response.blob();

                formData.append("image", blob, "scene.jpg");
            } else {
                formData.append("image", {
                    uri: photo.uri,
                    name: "scene.jpg",
                    type: "image/jpeg",
                });
            }

            const response = await axios.post(
                "http://192.168.7.6:5000/analyze",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const result =
                response.data.description ||
                response.data.error ||
                "Aucune description.";

            setDescription(result);

            if (typeof result === "string") {
                Speech.speak(result, {
                    language: "fr-FR",
                });
            }

        } catch (error) {
            console.log(error);

            setDescription("Erreur pendant l'analyse");

            Speech.speak("Erreur pendant l'analyse");
        } finally {
            setIsLoading(false);
        }
    };

    if (!permission) {
        return <Text>Chargement...</Text>;
    }



    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>
                        Autoriser
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Minti</Text>
                <Text style={styles.subtitle}>Assistant Vision IA</Text>
            </View>

            <View style={styles.cameraWrapper}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                />
            </View>

            <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>Description :</Text>

                <Text style={styles.responseText}>
                    {description || 'En attente...'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={analyzeScene}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Capturer pour analyser</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.copyright}>
                © 2026 Fitia Ilaina. Tous droits réservés.
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },

    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },

    subtitle: {
        color: '#94a3b8',
        marginTop: 5,
        fontSize: 16,
    },

    cameraWrapper: {
        flex: 1,
        marginHorizontal: 15,
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#1e293b',
    },

    camera: {
        flex: 1,
    },

    responseContainer: {
        margin: 15,
        padding: 20,
        backgroundColor: '#111827',
        borderRadius: 20,
        minHeight: 120,
    },

    responseTitle: {
        color: '#38bdf8',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },

    responseText: {
        color: 'white',
        fontSize: 16,
        lineHeight: 24,
    },

    button: {
        backgroundColor: '#2563eb',
        marginHorizontal: 20,
        marginBottom: 30,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
    },

    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: 20,
    },

    permissionText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 20,
    },

    permissionButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
    },
    copyright: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 12,
    marginBottom: 10,
},
});