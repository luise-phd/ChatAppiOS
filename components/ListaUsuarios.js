import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
// import * as Permissions from 'expo-permissions';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  console.log(`Tarea en segundo plano ejecutada en: ${new Date(now).toISOString()}`);

  // Agregar notificación
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tienes mensajes sin leer',
      body: 'Revisa la aplicación para más detalles.',
      sound: 'default',
    },
    trigger: null,
  });

  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
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
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

import Axios from 'axios';
Axios.defaults.baseURL = 'http://192.168.20.23:4000';
// Axios.defaults.baseURL = 'https://backchatapp-production.up.railway.app'

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

      const usuariosActivos = respuesta2.data.usuarios.filter((usuario) => {
        return usuario.state === "Activo" && usuario._id !== id;
      });
      setUsuarios(usuariosActivos);
    } catch (error) {
      console.log(error);
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

  /*const checkBackgroundTaskPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
    if (status === 'granted') {
      console.log('Permisos de tareas en segundo plano otorgados.');
    } else {
      console.log('Permisos de tareas en segundo plano denegados.');
    }
  };*/

  // Manejador de notificaciones en primer plano
  /*const notificationForegroundListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificación recibida en primer plano:', notification);
  });

  // Manejador de notificaciones en segundo plano
  const notificationBackgroundListener = Notifications.addNotificationResponseReceivedListener(notification => {
    console.log('Notificación recibida en segundo plano:', notification);
  });*/

  const checkStatusAsync = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      await registerBackgroundFetchAsync();
    } /*else {
      await unregisterBackgroundFetchAsync();
    }*/
    console.log(isRegistered)
    registerBackgroundFetchAsync();
  };

  useEffect(() => {
    checkAndRequestNotificationPermissions();
    // checkBackgroundTaskPermissions();

    fetchUsuarios();
    checkStatusAsync();

    const intervalId = setInterval(() => {
      if (totalMensajesSinLeer > 0) {
        fetchUsuarios();
      }
    }, 5000);

    const intervalId2 = setInterval(() => {
      if (totalMensajesSinLeer > 0) {
        showNotification(totalMensajesSinLeer);
      }
    }, 60000);

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
      navigation.navigate("EditUser", { 
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
        <Text style={{fontSize: 16}}>{item.nombre}</Text>
        <Text style={{fontSize: 14}}>{item.phone}</Text>
      </View>
      <Text style={{fontSize: 14}}>{item.mensajesSinLeer > 0 ? item.mensajesSinLeer: ""}</Text>
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
