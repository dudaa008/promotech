import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from './BancodeDados';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmSenha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCarregando(true);
    try {
      // Insere o novo usuário na tabela "cadastro" do Supabase
      const { error } = await supabase.from('cadastro').insert([{
        nome: nome.trim(),
        email: email.trim(),
        senha: senha,
      }]);

      if (error) {
        Alert.alert('Erro no cadastro', error.message);
        return;
      }

      // O usuário precisa fazer login para o @user_id ser salvo corretamente
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Faça login para continuar.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LinearGradient
      // Fundo com gradiente laranja/amarelo
      colors={['#FF8C00', '#FFA500', '#FFD700']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cadastre-se</Text>

        <View style={styles.inputBox}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={nome}
            onChangeText={setNome}
          />
        </View>

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
            placeholder="Senha (mín. 6 caracteres)"
            placeholderTextColor="rgba(255,255,255,0.7)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <View style={styles.inputBox}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            placeholderTextColor="rgba(255,255,255,0.7)"
            secureTextEntry
            value={confirmSenha}
            onChangeText={setConfirmSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={carregando}>
          <Text style={styles.buttonText}>{carregando ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLogin}>
          <Text style={styles.backToLoginText}>Voltar para Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  backToLogin: {
    marginTop: 15,
    alignSelf: 'center',
  },
  backToLoginText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
