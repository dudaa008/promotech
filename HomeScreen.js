import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './BancodeDados';

export default function HomeScreen() {
  const [produtos, setProdutos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    setCarregando(true);
    try {
       // Busca todos os produtos, do mais recente para o mais antigo
      const { data: produtosDB, error } = await supabase
        .from('produtos')
        .select('*')
        .order('id', { ascending: false });

      if (error) console.error('Erro', 'Erro ao buscar produtos:');

      const produtosFormatados = (produtosDB || []).map(item => ({
        id: String(item.id),
        nome: item.nome,
        preco: String(item.preco),
        descricao: item.descricao || '',
        category: item.category || '',
        local: item.store,
        image: item.image,
        data: item.data || '',
        hora: item.hora || '',
      }));

      setProdutos(produtosFormatados);

      const favoritosSalvos = await AsyncStorage.getItem('@lista_favoritos');
      if (favoritosSalvos !== null) {
        setFavoritos(JSON.parse(favoritosSalvos));
      }
    } catch (error) {
      console.error('Erro', 'Erro ao carregar dados:');
    } finally {
      setCarregando(false);
    }
  };

  // Adiciona ou remove um produto da lista de favoritos
  const alternarFavorito = async (id) => {
    try {
      let novaLista = [...favoritos];
      if (novaLista.includes(id)) {
        novaLista = novaLista.filter(fid => fid !== id);
      } else {
        novaLista.push(id);
      }
      setFavoritos(novaLista);
      await AsyncStorage.setItem('@lista_favoritos', JSON.stringify(novaLista));
    } catch (error) {
      console.error('Erro', 'Erro ao salvar favorito:');
    }
  };

  const produtosFiltrados = produtos.filter(
    p =>
      p.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (p.local || '').toLowerCase().includes(pesquisa.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(pesquisa.toLowerCase())
  );

  // Enquanto carrega, exibe apenas o spinner centralizado
  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.inputPesquisa}
        placeholder="Buscar produto, loja ou categoria..."
        placeholderTextColor="#888"
        value={pesquisa}
        onChangeText={setPesquisa}
      />

      <FlatList
        data={produtosFiltrados}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isFavorito = favoritos.includes(item.id);
          return (
            <View style={styles.card}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholderImage]} />
              )}

              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.preco}>R$ {item.preco}</Text>
                <Text style={styles.local}>📍 {item.local}</Text>
                {item.descricao ? <Text style={styles.descricao}>{item.descricao}</Text> : null}
                {item.category ? <Text style={styles.category}>🏷️ {item.category}</Text> : null}
                {(item.data || item.hora) ? (
                  <Text style={styles.dataHora}>
                    {item.data ? `📅 ${item.data}` : ''}
                    {item.data && item.hora ? '  ' : ''}
                    {item.hora ? `🕐 ${item.hora}` : ''}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.botaoFavorito}
                onPress={() => alternarFavorito(item.id)}
                activeOpacity={0.6}
              >
                <View style={styles.coracaoContainer}>
                  <View style={[styles.coracaoParte, styles.coracaoEsquerda, { backgroundColor: isFavorito ? '#E91E63' : '#B0B0B0' }]} />
                  <View style={[styles.coracaoParte, styles.coracaoDireita, { backgroundColor: isFavorito ? '#E91E63' : '#B0B0B0' }]} />
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.textoVazio}>
            {pesquisa ? 'Nenhum produto encontrado 😕' : 'Nenhum produto cadastrado ainda.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  inputPesquisa: {
    height: 45,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF7EB',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    alignSelf: 'center',
  },
  placeholderImage: {
    backgroundColor: '#E1E1E1',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 35,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  preco: {
    color: '#2D5A27',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  local: {
    fontSize: 12,
    color: '#666',
  },
  descricao: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  category: {
    fontSize: 11,
    color: '#FF8C00',
    marginTop: 2,
    fontWeight: '600',
  },
  dataHora: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
  },
  botaoFavorito: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coracaoContainer: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  coracaoParte: {
    position: 'absolute',
    width: 10,
    height: 16,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  coracaoEsquerda: {
    left: 0,
    transform: [{ rotate: '-45deg' }],
  },
  coracaoDireita: {
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  textoVazio: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});
