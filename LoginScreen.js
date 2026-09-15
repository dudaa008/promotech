 import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './BancodeDados';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    setCarregando(true);
    try {
      // Busca na tabela "cadastro" um registro com o e-mail e senha informados
      const { data, error } = await supabase
        .from('cadastro')
        .select('*')
        .eq('email', email.trim())
        .eq('senha', senha)
        .single();

      if (error || !data) {
        Alert.alert('Acesso negado', 'E-mail ou senha incorretos.');
        return;
      }
      
      // Salva o ID do usuário localmente e navega para o app principal
      await AsyncStorage.setItem('@user_id', String(data.id));
      navigation.replace('MainApp');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o login.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FF8C00', '#FFA500', '#FFD700']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('./assets/PromoTechLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bem-vindo</Text>

        <View style={styles.inputBox}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputBox}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={carregando}>
          <Text style={styles.buttonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotPass}
          onPress={() => navigation.navigate('EsqueciSenha')}
        >
          <Text style={styles.forgotText}>Esqueci minha senha!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.registerText}>Cadastrar-se</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 35,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    marginBottom: 25,
    paddingBottom: 5,
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPass: {
    marginTop: 15,
    alignSelf: 'center',
  },
  forgotText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});