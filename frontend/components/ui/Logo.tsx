import { View, Image, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 100 }: LogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});