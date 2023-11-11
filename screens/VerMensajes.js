import {
  StyleSheet, View, Text, FlatList, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform
} from "react-native";

import { useRef, useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Axios from '../connect/server';

const Separator = () => <View style={styles.separator} />;

export default function VerMensajes() {
  const scrollViewRef = useRef(null);
  // const flatListRef = useRef(null);

  const [msg, setMsg] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [edicionRealizada, setEdicionRealizada] = useState(false);

  const route = useRoute();
  const telOrigen = route.params?.phoneOrigen;
  const telDestino = route.params?.phoneDestino;

  const obtenerMensajes = async () => {
    // const id = await AsyncStorage.getItem("idUsuario");
    const token = await AsyncStorage.getItem("token");
    // const nombre = await AsyncStorage.getItem("nombre");

    const respuesta = await Axios.get(
      "/mensajes/listar/" + telOrigen + "/" + telDestino,
      {
        headers: { autorizacion: token },
      }
    );
    setMensajes(respuesta.data);
  };

  useEffect(() => {
    obtenerMensajes();
  }, [telOrigen, telDestino]);

  useEffect(() => {
    if (!edicionRealizada) {
      editarEstadosMensajes();
    }

    const intervalId = setInterval(() => {
      obtenerMensajes();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [obtenerMensajes, editarEstadosMensajes]);

  const handleContentSizeChange = () => {
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToEnd({ animated: true });
    // }
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  /*const renderItem = ({ item }) => {
    const utcDate = item.date;
    const date = new Date(utcDate);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      // weekday: 'long',
      hour: "numeric",
      minute: "numeric",
      // second: 'numeric',
      hour12: false,
    };
    const localDate = date.toLocaleString("es-ES", options);
    return (
      <TouchableOpacity style={[styles.item, { width: deviceWidth }]}>
        <Text style={{ fontSize: 16 }}>{item.msg}</Text>
        <Text style={{ fontSize: 10 }}>{localDate}</Text>
      </TouchableOpacity>
    );
  };*/


  const handleEnviar = async (e) => {
    e.stopPropagation();
    const mensaje = {
      msg,
      phoneDestino: telOrigen,
      phoneOrigen: telDestino,
    };
    if (msg === "") {
      console.log("Por favor escriba un mensaje");
    } else {
      const token = await AsyncStorage.getItem("token");
      await Axios.post("/mensajes/enviar", mensaje, {
        headers: { autorizacion: token },
      });
      setMsg("");
    }
  };

  const editarEstadosMensajes = async () => {
    const token = await AsyncStorage.getItem("token");
    const respuesta = await Axios.get("/mensajes/listar/"+ telOrigen + "/" + telDestino, {
      headers: { autorizacion: token },
    });
    setMensajes(respuesta.data);

    // Obtener los IDs de los mensajes para editar el estado
    const mensajeIds = respuesta.data.map((mensaje) => mensaje._id);

    await Axios.post("/mensajes/editarEstado/"+ telOrigen + "/" + telDestino, { mensajeIds }, {
      headers: { autorizacion: token },
    });

    setEdicionRealizada(true);
  };

  const handleClicMsg = (item) => {
    console.log(item.msg);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 66 : 0}>
      {/* Si intento usar la lista plana no funciona desplazar la lista
      al último item, genera un error cuando trato de usar la
      instrucción ref={flatListRef} */}
      {/* <FlatList
        data={mensajes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.flatList}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.flatListContent}
        onContentSizeChange={handleContentSizeChange}
      /> */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onContentSizeChange={handleContentSizeChange}
        keyboardDismissMode="on-drag">
        {mensajes.map((item, index) => {
          const utcDate = item.date;
          const date = new Date(utcDate);
          const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            // weekday: 'long',
            hour: "numeric",
            minute: "numeric",
            // second: 'numeric',
            hour12: false,
          };
          const localDate = date.toLocaleString("es-ES", options);
          return (
            <View style={styles.item} key={index}>
              <TouchableOpacity onPress={() => handleClicMsg(item)}>
                <Text style={{ fontSize: 16 }}>{item.msg}</Text>
                <Text style={{ fontSize: 10 }}>{localDate}</Text>
                {/* <Separator /> */}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Escribir mensaje..."
          value={msg}
          onChangeText={setMsg}
          multiline={true}
          numberOfLines={4}
        />
        {/* <Button title="Enviar" onPress={handleEnviar} /> */}
        <TouchableOpacity style={styles.buttonContainer} onPress={handleEnviar}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    // width: "99%",
    flexDirection: "column",
    // justifyContent: "space-between",
    // alignItems: "flex-start",
    borderWidth: 0.5,
    borderColor: "gray",
    padding: 5,
    margin: 2
  },
  // flatList: {
  //   flex: 0.97,
  // },
  scrollView: {
    flex: 0.97,
  },
  footer: {
    flex: 0.03,
  },
  input: {
    width: "84%",
    height: 60,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  row: {
    flex: 0.13,
    flexDirection: "row",
    marginRight: 10,
    marginBottom: -4,
    // paddingBottom: 2,
    paddingLeft: 2,
    paddingRight: 4,
    alignItems: "center",
  },
  buttonContainer: {
    width: "18.7%",
    height: 60,
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
  // flatListContent: {
  //   flexGrow: 1,
  //   justifyContent: "flex-start",
  // },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: 'black'
  }
});
