import { StyleSheet, View, Text } from "react-native";

export default function Footer() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 14 }} numberOfLines={1}>
        2023
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.03,
    backgroundColor: '#F4CE14',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    padding: 1
  },
});
