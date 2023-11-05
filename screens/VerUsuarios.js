import { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { useRoute } from "@react-navigation/native";

import ListaUsuarios from "../components/ListaUsuarios";
import Footer from "../components/Footer";

export default function VerUsuarios() {
  const navigation = useNavigation()

  const [phone, setPhone] = useState("");
  const [admin, setAdmin] = useState("");
  const [adminAsync, setAdminAsync] = useState("");
  const [flag, setFlag] = useState("");
  const route = useRoute();
  
  useEffect(() => {
    setPhone(route.params?.phone);
    setAdmin(route.params?.admin);
    validarAdmin();
    setFlag("add");
  }, [phone, admin]);

  const addUsuarios = () => {
    navigation.navigate("EditAddUser", {
      flag: flag,
    });
  };

  const editPassword = () => {
    navigation.navigate("EditPass");
  };

  const validarAdmin = async () => {
    setAdminAsync(await AsyncStorage.getItem("admin"));
  }

  return (
    <View style={styles.container}>
      {/* <Header phone={phone}/> */}
      <ListaUsuarios admin={admin} />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.buttonContainer,
            { opacity: admin === "Si" || adminAsync === "Si" ? 1 : 0.5 }
          ]}
          onPress={admin === "Si" || adminAsync === "Si" ? addUsuarios : null}
          disabled={admin !== "Si" && adminAsync !== "Si" }
        >
          <Text style={styles.buttonText}>Agregar usuarios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={editPassword}>
          <Text style={styles.buttonText}>Editar contraseña</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    backgroundColor: "tomato",
    padding: 5,
    borderRadius: 5,
    flex: 1, // Asegura que los elementos ocupen el mismo espacio
    marginRight: 1, // Espacio entre los botones
    marginLeft: 1,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Separa los elementos horizontalmente
    paddingHorizontal: 1, // Espaciado horizontal para los elementos en la fila
    marginTop: 1,
    marginBottom: 1,
  },
});