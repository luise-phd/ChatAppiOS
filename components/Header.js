import { StyleSheet, View, Text, Dimensions } from "react-native";

export default function Header({phone}) {
  const deviceWidth = Dimensions.get('window').width - 10;
  return (
    <View style={styles.container}>
      <Text style={{ fontSize:30, width: deviceWidth, textAlign: "center", }}>{phone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.05,
    // alignItems: "center",
    alignContent: 'center',
    justifyContent: "center",
    backgroundColor: '#F4CE14',
    // paddingTop: 5,
  },
});
