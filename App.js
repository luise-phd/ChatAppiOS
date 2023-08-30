// import "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import VerUsuarios from "./screens/VerUsuarios";
import VerMensajes from "./screens/VerMensajes";
import Login from "./screens/Login";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* <Stack.Navigator initialRouteName="Login" screenOptions={{ headerTitle: "Chat App iOS" }}> */}
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="VerUsuarios" component={VerUsuarios} />
        <Stack.Screen name="VerMensajes" component={VerMensajes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
