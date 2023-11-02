import { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';

import Axios from 'axios';
Axios.defaults.baseURL = 'http://192.168.20.23:4000';
// Axios.defaults.baseURL = 'https://backchatapp-production.up.railway.app'

const EditPass = () => {
  const navigation = useNavigation()
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  
  useEffect(() => {
    
  }, []);

  const editPassword = async () => {
    const id = await AsyncStorage.getItem('idUsuario')
    const token = await AsyncStorage.getItem("token");
    try {
      if(currentPass === "")
        Alert.alert("Ingrese la contraseña actual")
      else if(newPass === "")
        Alert.alert("Debe ingresar una contraseña nueva")
      else if(currentPass === newPass)
        Alert.alert("La contraseña nueva no debería ser igual a la contraseña actual")
      else if(confirmPass === "")
        Alert.alert("Debe confirmar la contraseña nueva")
      else if(newPass !== confirmPass)
        Alert.alert("La contraseña nueva no coincide")
      else {
        const respuesta = await Axios.get("/usuarios/editarPass/" + id + "/" + currentPass + "/" + newPass, {
          headers: { autorizacion: token },
        });
        // console.log(respuesta.data)
        if (respuesta.data === "ok") {
            Alert.alert("Contraseña editada")
            navigation.goBack();
        } else {
          Alert.alert("La contraseña actual no coincide con la contraseña almacenada")
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        keyboardDismissMode="on-drag">
        <Text style={styles.regularText}>Editar Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Contraseña actual"
          value={currentPass}
          onChangeText={setCurrentPass}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña nueva"
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry
        />
        <TouchableOpacity style={styles.buttonContainer} onPress={editPassword}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  regularText: {
    fontSize: 24,
    paddingBottom: 20,
    color: 'black',
    textAlign: 'center'
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#007AFF",
    borderRadius: 4
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default EditPass;