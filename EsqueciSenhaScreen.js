import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from './BancodeDados';

export default function EsqueciSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }

    setCarregando(true);
    try {
       // Solicita ao Supabase o envio do e-mail de redefinição de senha
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        Alert.alert('Erro', 'Ocorreu um erro. Verifique o e-mail e tente novamente');
        return;
      }

       // Sucesso: avisa o usuário e volta para a tela anterior (login)
      Alert.alert('E-mail enviado!','Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LinearGradient colors={['#FF8C00', '#FFA500', '#FFD700']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Esqueci minha senha</Text>
        <Text style={styles.subtitle}>Digite seu e-mail para receber as instruções.</Text>

        <View style={styles.inputBox}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="E-mail cadastrado"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={carregando}>
          <Text style={styles.buttonText}>{carregando ? 'ENVIANDO...' : 'ENVIAR LINK'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar para o Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 25,
    alignSelf: 'center',
  },
  backText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});