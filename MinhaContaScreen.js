import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from './BancodeDados';

export default function MinhaContaScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState(false);
  const [ajudaExpandida, setAjudaExpandida] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmNovaSenha, setConfirmNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const carregarPerfil = async () => {
    try {
      // Recupera o ID do usuário salvo localmente após o login
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return; 

      const { data, error } = await supabase
        .from('cadastro')
        .select('nome, email')
        .eq('id', parseInt(userId))
        .single();

      if (error || !data) return;

      setUsuario({ nome: data.nome, email: data.email });
    } catch (error) {
      console.error('Erro', 'Erro ao carregar perfil:');
    } finally {
      setCarregando(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!novaSenha || !confirmNovaSenha) {
      Alert.alert('Erro', 'Preencha os campos de nova senha.');
      return;
    }
    if (novaSenha !== confirmNovaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSalvandoSenha(true);
    
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      // Atualiza a senha no banco para o usuário logado
      const { error } = await supabase
        .from('cadastro')
        .update({ senha: novaSenha })
        .eq('id', parseInt(userId));

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
      setNovaSenha('');
      setConfirmNovaSenha('');
      setExpandido(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
    } finally {
      setSalvandoSenha(false);
    }
  };

  const handleCentralAjuda = () => {
    Alert.alert('Central de Ajuda', 'Como podemos te ajudar? Envie um e-mail para suporte@promotech.com');
  };

  const handleSairConta = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
             // Remove o ID salvo e volta para a tela de login
            await AsyncStorage.removeItem('@user_id');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerPerfil}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account" size={60} color="#FF8C00" />
        </View>
        <Text style={styles.boasVindas}>Olá, {usuario?.nome}!</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>NOME</Text>
        <Text style={styles.valor}>{usuario?.nome}</Text>
        <View style={styles.divisor} />
        <Text style={styles.label}>E-MAIL CADASTRADO</Text>
        <Text style={styles.valor}>{usuario?.email}</Text>
      </View>

      <View style={styles.menuGeralContainer}>
        <TouchableOpacity
          style={styles.botaoMenu}
          onPress={() => setExpandido(!expandido)}
          activeOpacity={0.7}
        >
          <View style={styles.menuEsquerda}>
            <MaterialCommunityIcons name="lock-reset" size={22} color="#FF8C00" />
            <Text style={styles.botaoMenuTexto}>Alterar Senha</Text>
          </View>
          <MaterialCommunityIcons name={expandido ? 'chevron-up' : 'chevron-down'} size={24} color="#666" />
        </TouchableOpacity>

        {expandido && (
          <View style={styles.formularioSenha}>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#FF8C00" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nova senha (mín. 6 caracteres)"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={novaSenha}
                onChangeText={setNovaSenha}
              />
            </View>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color="#FF8C00" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmNovaSenha}
                onChangeText={setConfirmNovaSenha}
              />
            </View>
            <TouchableOpacity
              style={styles.botaoSalvarSenha}
              onPress={handleAlterarSenha}
              disabled={salvandoSenha}
            >
              <Text style={styles.botaoSalvarTexto}>
                {salvandoSenha ? 'Salvando...' : 'Atualizar Senha'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.linhaDivisoraMenu} />

        <TouchableOpacity style={styles.botaoMenu} onPress={() => setAjudaExpandida(!ajudaExpandida)} activeOpacity={0.7}>
          <View style={styles.menuEsquerda}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color="#FF8C00" />
            <Text style={styles.botaoMenuTexto}>Central de Ajuda</Text>
          </View>
          <MaterialCommunityIcons name={ajudaExpandida ? 'chevron-up' : 'chevron-down'} size={24} color="#666" />
        </TouchableOpacity>

        {ajudaExpandida && (
          <View style={styles.ajudaContainer}>
            <Text style={styles.ajudaTexto}>Precisa de ajuda? Envie um e-mail para{' '}
              <Text style={styles.ajudaEmail}>suporte@promotech.com</Text>
            </Text>
            <Text style={styles.ajudaTexto}>Para um atendimento mais rápido, nos informe:</Text>
            <Text style={styles.ajudaItem}>• O seu nome completo e e-mail de cadastro.</Text>
            <Text style={styles.ajudaItem}>• Uma breve descrição do que está acontecendo (se possível, anexe um print da tela).</Text>
          </View>
        )}

        <View style={styles.linhaDivisoraMenu} />

        <TouchableOpacity style={styles.botaoMenu} onPress={handleSairConta} activeOpacity={0.7}>
          <View style={styles.menuEsquerda}>
            <MaterialCommunityIcons name="logout" size={22} color="#E53935" />
            <Text style={[styles.botaoMenuTexto, { color: '#E53935' }]}>Sair da Conta</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  contentContainer: { 
    padding: 20, 
    paddingBottom: 20 
  },
  centro: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerPerfil: { 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 30 
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF7EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 32,
  },
  boasVindas: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center' 
  },
  infoContainer: {
    backgroundColor: '#FFF7EB',
    padding: 20,
    borderRadius: 15,
    elevation: 1,
    marginBottom: 20,
  },
  label: { 
    fontSize: 12, 
    color: '#444', 
    fontWeight: 'bold', 
    marginBottom: 5, 
    letterSpacing: 0.5 
  },
  valor: { 
    fontSize: 16, 
    color: '#444', 
    marginBottom: 5 
  },
  divisor: { 
    height: 1, 
    backgroundColor: 'rgba(255,140,0,0.15)', 
    marginBottom: 15 
  },
  menuGeralContainer: {
    backgroundColor: '#FFF',
    borderColor: '#FFE0B2',
    borderWidth: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  botaoMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#FFF',
  },
  menuEsquerda: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  botaoMenuTexto: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginLeft: 12 
  },
  formularioSenha: { 
    paddingHorizontal: 18, 
    paddingBottom: 18, 
    backgroundColor: '#FFF' 
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 48,
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    color: '#333', 
    fontSize: 15 
  },
  botaoSalvarSenha: {
    backgroundColor: '#1E88E5',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoSalvarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  linhaDivisoraMenu: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 15 },
  ajudaContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: '#FFF',
  },
  ajudaTexto: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  ajudaEmail: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  ajudaItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    lineHeight: 20,
    paddingLeft: 5,
  },
});
