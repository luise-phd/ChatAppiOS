import { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from "react-native";
import ModalDropdown from 'react-native-modal-dropdown';

import { useRoute } from "@react-navigation/native";

import AsyncStorage from '@react-native-async-storage/async-storage';

import Axios from '../connect/server';

const EditUser = () => {
  const navigation = useNavigation();
  const [idusuario, setIdUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [admin, setAdmin] = useState("");
  const [state, setState] = useState("");
  const [adminSelect, setAdminSelect] = useState("");
  const [stateSelect, setStateSelect] = useState("");

  const [flag, setFlag] = useState("");

  const route = useRoute();
  
  useEffect(() => {
    if (route.params?.phoneDestino) {
      setIdUsuario(route.params.idusuario);
      setNombre(route.params.nombre);
      setPhone(route.params.phoneDestino);
      setEmail(route.params.email);
      setAdmin(route.params.admin);
      setState(route.params.state);
      setAdminSelect(route.params.admin);
      setStateSelect(route.params.state);
    }
    if (route.params?.flag) {
      setFlag(route.params.flag);
      setAdminSelect("Si");
      setStateSelect("Activo");
    }
  }, []);

  const editUsuario = async () => {
    // const id = await AsyncStorage.getItem('idUsuario');
    const token = await AsyncStorage.getItem("token");
    
    try {
      const usuario = {
        nombre,
        phone,
        email,
        admin: adminSelect,
        state: stateSelect
      }
      const respuesta = await Axios.put("/usuarios/editar/" + idusuario, usuario, {
        headers: { autorizacion: token },
      })
      const mensaje = respuesta.data.mensaje
  
      Alert.alert(mensaje);
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  const delUsuario = async () => {
    const token = await AsyncStorage.getItem("token");
    const respuesta = await Axios.delete("/usuarios/eliminar/" + idusuario, {
      headers: { autorizacion: token },
    })
    const mensaje = respuesta.data.mensaje
    Alert.alert(mensaje);
    navigation.goBack();
  };

  const addUsuario = async () => {
    const token = await AsyncStorage.getItem("token");

    const usuario = {
      nombre,
      phone,
      email,
      admin: adminSelect,
      state: stateSelect,
      pass: '123',
    }
    if (nombre === '') {
      Alert.alert('Por favor ingresar el nombre');
    } else if (phone === '') {
      Alert.alert('Por favor ingresar el teléfono');
    } else if (email === '') {
      Alert.alert('Por favor ingresar el correo electrónico');
    } else {
      const respuesta = await Axios.post('/usuarios/adicionar', usuario, {
        headers: {'autorizacion': token}
      });
      const mensaje = respuesta.data.mensaje
      Alert.alert(mensaje)

      setNombre('');
      setPhone('');
      setEmail('');
      setAdmin('Si');
      setState('Activo');
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
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
        />
        <View style={styles.dropdownContainer}>
          <Text>Administrador </Text>
          <ModalDropdown style={styles.dropdown}
            dropdownStyle={styles.dropdownDropdown}
            options={["Si", "No"]}
            defaultValue={adminSelect}
            onSelect={(index, value) => setAdminSelect(value)}
          />
        </View>
        <View style={styles.dropdownContainer}>
          <Text>Estado </Text>
          <ModalDropdown style={styles.dropdown}
            dropdownStyle={styles.dropdownDropdown}
            options={["Activo", "Inactivo"]}
            defaultValue={stateSelect}
            onSelect={(index, value) => {
              // console.log('index:', index, '- value:', value, '- stateSelect:', stateSelect);
              setStateSelect(value);
            }}
          />
        </View>
        {flag !== "add" ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.buttonContainerRow} onPress={editUsuario}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainerRow} onPress={delUsuario}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.buttonContainer} onPress={addUsuario}>
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 5,
  },
  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
  },
  dropdownDropdown: {
    width: 120,
    height: 70,
    borderColor: 'gray',
    borderWidth: 1,
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
  buttonContainerRow: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#007AFF",
    borderRadius: 5,
    flex: 1, // Asegura que los elementos ocupen el mismo espacio
    marginRight: 1,
    marginLeft: 1,
    marginTop: 5
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Separa los elementos horizontalmente
    paddingHorizontal: 0,
    marginTop: 1,
    marginBottom: 1,
  },
});

export default EditUser;