import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";

import { useRoute } from "@react-navigation/native";

import ListaUsuarios from "../components/ListaUsuarios";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function VerUsuarios() {
  // const [phone, setPhone] = useState("")

  // const route = useRoute();
  // const telefono = route.params?.phone;
  
  // useEffect(() => {
  //   setPhone(telefono);
  //   console.log(telefono);
  // }, []);

  return (
    <View style={styles.container}>
      {/* <Header phone={phone}/> */}
      <ListaUsuarios />
      <Footer />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    // justifyContent: "center",
  },
});
