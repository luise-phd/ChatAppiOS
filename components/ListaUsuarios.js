import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const mensajesSinLeer = await AsyncStorage.getItem('totalMensajesSinLeer');
  const now = Date.now();
  console.log(`Tarea en segundo plano ejecutada en: ${new Date(now).toISOString()}`);
  console.log(`Total de mensajes sin leer: ${mensajesSinLeer}`);

  if(parseInt(mensajesSinLeer, 10) > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tienes mensajes sin leer',
        body: 'Revisa la aplicación para más detalles.',
        // sound: 'default',
      },
      trigger: null,
    });
    // const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    // if (isRegistered) {
    //   await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    //   console.log('Tarea des registrada');
    // }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } else {
    console.log('No hay mensajes sin leer');
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetchAsync(totalMensajesSinLeer) {
  await AsyncStorage.setItem('totalMensajesSinLeer', totalMensajesSinLeer.toString());
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 5,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Tarea en segundo plano registrada con éxito.');
  } catch (error) {
    console.log('Error al registrar la tarea en segundo plano:', error);
  }
}

async function unregisterBackgroundFetchAsync() {
  console.log('Tarea en segundo plano deshabilitada.');
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

import Axios from '../connect/server';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Separator = () => <View style={styles.separator} />;

const ListaUsuarios = ({ admin }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [phone, setPhone] = useState("");
  const [adminAsync, setAdminAsync] = useState("");
  const navigation = useNavigation();

  const fetchUsuarios = async () => {
    const id = await AsyncStorage.getItem("idUsuario");
    const token = await AsyncStorage.getItem("token");
    setAdminAsync(await AsyncStorage.getItem("admin"));
    
    try {
      const respuesta = await Axios.get(`/usuarios/buscar/${id}`, {
        headers: { autorizacion: token },
      });
      
      const phone = respuesta.data.phone;
      setPhone(phone);
      
      const respuesta2 = await Axios.get(`/usuarios/listarUsuariosConMensajes/${phone}`, {
          headers: { autorizacion: token },
        }
      );

      if(admin === "Si" || adminAsync === "Si") {
        const usuarios = respuesta2.data.usuarios.filter((usuario) => {
          return usuario._id !== id;
        });
        setUsuarios(usuarios);
      } else {
        const usuariosActivos = respuesta2.data.usuarios.filter((usuario) => {
          return usuario.state === "Activo" && usuario._id !== id;
        });
        setUsuarios(usuariosActivos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalMensajesSinLeer = usuarios.reduce(
    (total, usuario) => total + usuario.mensajesSinLeer, 0
  );

  /*const showNotification = async (totalMensajesSinLeer) => {
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
  };*/

  const checkAndRequestNotificationPermissions = async () => {
    const settings = await Notifications.getPermissionsAsync();
  
    if (settings.status !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('Permisos de notificación otorgados.');
      } else {
        console.log('Permisos de notificación denegados.');
      }
    } else {
      console.log('Permisos de notificación otorgados.');
    }
  };

  useEffect(() => {
    checkAndRequestNotificationPermissions();

    fetchUsuarios();

    const intervalId = setInterval(() => {
      if (totalMensajesSinLeer > 0) {
        fetchUsuarios();
      }
    }, 5000);

    const intervalId2 = setInterval(() => {
      if (totalMensajesSinLeer > 0) {
        // showNotification(totalMensajesSinLeer);
        registerBackgroundFetchAsync(totalMensajesSinLeer);
      } else {
        unregisterBackgroundFetchAsync();
      }
    }, 60000);

    if (totalMensajesSinLeer > 0) {
      registerBackgroundFetchAsync(totalMensajesSinLeer);
    } else {
      unregisterBackgroundFetchAsync();
    }

    return () => {
      clearInterval(intervalId);
      clearInterval(intervalId2);
    }
  }, [totalMensajesSinLeer]);

  const handleItemClick = (item) => {
    navigation.navigate("VerMensajes", { phoneOrigen: phone, phoneDestino: item.phone });
  };

  const handleLongPress = (item) => {
    if(admin === "Si" || adminAsync === "Si") {
      navigation.navigate("EditAddUser", {
        idusuario: item._id,
        nombre: item.nombre, 
        phoneDestino: item.phone,
        email: item.email,
        admin: item.admin,
        state: item.state,
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, { width: deviceWidth }]}
      onLongPress={() => handleLongPress(item)}
      onPress={() => handleItemClick(item)}>
      <View style={styles.leftColumn}>
        <Text style={{ fontSize: 16, color: item.state === 'Inactivo' ? 'lightgray' : 'black' }}>{item.nombre}</Text>
        <Text style={{ fontSize: 14, color: item.state === 'Inactivo' ? 'lightgray' : 'black' }}>{item.phone}</Text>
      </View>
      <Text style={{ fontSize: 14, color: item.state === 'Inactivo' ? 'lightgray' : 'black' }}>
        {item.mensajesSinLeer > 0 ? item.mensajesSinLeer: ""}
      </Text>
    </TouchableOpacity>
  );

  const deviceWidth = Dimensions.get('window').width - 10;

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={Separator}
      />
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
