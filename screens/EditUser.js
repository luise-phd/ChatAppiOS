import { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from "react-native";
import ModalDropdown from 'react-native-modal-dropdown';
import { Picker } from "@react-native-picker/picker";

import { useRoute } from "@react-navigation/native";

import AsyncStorage from '@react-native-async-storage/async-storage';

import Axios from 'axios';
Axios.defaults.baseURL = 'http://192.168.20.23:4000';
// Axios.defaults.baseURL = 'https://backchatapp-production.up.railway.app'

const EditUser = () => {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [admin, setAdmin] = useState("");
  const [state, setState] = useState("");

  const route = useRoute();
  
  useEffect(() => {
    if (route.params?.phoneDestino) {
      setNombre(route.params.nombre);
      setTelefono(route.params.phoneDestino);
      setEmail(route.params.email);
      setAdmin(route.params.admin);
      setState(route.params.state);
    }
  }, []);

  const editUsuario = async () => {
    const id = await AsyncStorage.getItem('idUsuario');
    const token = await AsyncStorage.getItem("token");
    
    try {
      
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
        <Text style={styles.regularText}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          keyboardType="numeric"
          value={telefono}
          onChangeText={setTelefono}
        />
        <View style={styles.dropdownContainer}>
          <Text>Administrador: </Text>
          <ModalDropdown
            options={["Si", "No"]}
            defaultValue={admin}
            onSelect={(index, value) => setAdmin(value)}
          />
        </View>
        <View style={styles.dropdownContainer}>
          <Text>Estado: </Text>
          <ModalDropdown
            options={["Activo", "Inactivo"]}
            defaultValue={state}
            onSelect={(index, value) => setState(value)}
          />
        </View>
        <TouchableOpacity style={styles.buttonContainer} onPress={editUsuario}>
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
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  dropdown: {
    position: 'absolute',
    right: 0,
  },
  buttonContainer: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#007AFF",
    borderRadius: 4,
    marginTop: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default EditUser;