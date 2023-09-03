import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Axios from 'axios';
// Axios.defaults.baseURL = 'http://192.168.20.23:4000';
Axios.defaults.baseURL = 'https://backchatapp-production.up.railway.app'

import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Separator = () => <View style={styles.separator} />;

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [phone, setPhone] = useState("");
  // const [newMessages, setNewMessages] = useState("");
  const navigation = useNavigation();

  const fetchUsuarios = async () => {
    const id = await AsyncStorage.getItem("idUsuario");
    const token = await AsyncStorage.getItem("token");
    // const nombre = await AsyncStorage.getItem("nombre");

    try {
      const respuesta = await Axios.get(`/usuarios/buscar/${id}`, {
        headers: { autorizacion: token },
      });
      const phone = respuesta.data.phone;
      setPhone(phone);
      // console.log(phone);

      const respuesta2 = await Axios.get(`/usuarios/listarUsuariosConMensajes/${phone}`, {
          headers: { autorizacion: token },
        }
      );

      const usuariosActivos = respuesta2.data.usuarios.filter((usuario) => {
        return usuario.state === "Activo" && usuario._id !== id;
      });
      setUsuarios(usuariosActivos);

      // const response = await Axios.get('/usuarios');
      // const response = await Axios.get('/usuario/listar', {
      //   headers: { autorizacion: token },
      // });

      // setUsuarios(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const totalMensajesSinLeer = usuarios.reduce(
    (total, usuario) => total + usuario.mensajesSinLeer, 0
  );

  const showNotification = async (totalMensajesSinLeer) => {
    const notificationId = 'mensajeSinLeer';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Mensajes sin leer',
        body: `Tienes ${totalMensajesSinLeer} mensajes sin leer`,
        sound: 'default',
      },
      trigger: null,
      identifier: notificationId,
    });
  };

  // No solicita los permisos al usuario, algo no funciona bien
  // const checkNotificationPermissions = async () => {
  //   const settings = await Notifications.getPermissionsAsync();
  //   if (settings.granted) {
  //     console.log('Permisos de notificación otorgados.');
  //   } else {
  //     console.log('Permisos de notificación denegados.');
  //   }
  // };

  // Este código va a quedar obsoleto
  const checkNotificationPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status === 'granted') {
      console.log('Permisos de notificación otorgados.');
    } else {
      console.log('Permisos de notificación denegados.');
    }
  };

  // Manejador de notificaciones en primer plano
  /*const notificationForegroundListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificación recibida en primer plano:', notification);
    // Puedes personalizar cómo manejar la notificación aquí
  });*/

  // Manejador de notificaciones en segundo plano
  const notificationBackgroundListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notificación recibida en segundo plano:', response.notification);
    // Puedes personalizar cómo manejar la notificación aquí
  });

  useEffect(() => {
    checkNotificationPermissions();

    fetchUsuarios();

    const intervalId = setInterval(() => {
      if (totalMensajesSinLeer > 0) {
        fetchUsuarios();
      }
    }, 2000);

    const intervalId2 = setInterval(() => {
      if (totalMensajesSinLeer > 0) {
        showNotification(totalMensajesSinLeer);
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      clearInterval(intervalId2);
    }
    
  }, [totalMensajesSinLeer]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, { width: deviceWidth }]} onPress={() => handleItemClick(item)}>
      <View style={styles.leftColumn}>
        <Text style={{fontSize: 16}}>{item.nombre}</Text>
        <Text style={{fontSize: 14}}>{item.phone}</Text>
      </View>
      <Text style={{fontSize: 14}}>{item.mensajesSinLeer > 0 ? item.mensajesSinLeer: ""}</Text>
    </TouchableOpacity>
  );

  const handleItemClick = (item) => {
    navigation.navigate("VerMensajes", { phoneOrigen: phone, phoneDestino: item.phone });
  };

  const deviceWidth = Dimensions.get('window').width - 10;

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={Separator}
      />
      {/* {elementos.map((elemento) => (
        <View style={styles.item} key={elemento._id}>
          <Text>{elemento.nombre}</Text>
        </View>
      ))} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 5,
    margin: 2,
  },
  leftColumn: {
    flex: 1,
    flexDirection: "column",
    marginRight: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: 'gray'
  }
});

export default ListaUsuarios;
