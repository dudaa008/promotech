import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './BancodeDados';

export default function FavoritosScreen() {
  const [produtosFavoritos, setProdutosFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [])
  );

  const carregarFavoritos = async () => {
    setCarregando(true);
    try {
      const favoritosSalvos = await AsyncStorage.getItem('@lista_favoritos');
      const ids = favoritosSalvos ? JSON.parse(favoritosSalvos) : [];

      if (ids.length === 0) {
        setProdutosFavoritos([]);
        return;
      }

      const { data: produtosDB, error } = await supabase
        .from('produtos')
        .select('*')
        .in('id', ids);

      if (error) {
        console.error('Erro', 'Erro ao buscar favoritos:');
        return;
      }

      const lista = (produtosDB || []).map(item => ({
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

      setProdutosFavoritos(lista);
    } catch (error) {
      console.error('Erro', 'Erro ao carregar favoritos:');
    } finally {
      setCarregando(false);
    }
  };

  
  const removerFavorito = async (id) => {
    try {
      const favoritosSalvos = await AsyncStorage.getItem('@lista_favoritos');
      let lista = favoritosSalvos ? JSON.parse(favoritosSalvos) : [];
      // Filtra removendo o id selecionado
      lista = lista.filter(fid => fid !== id);
      await AsyncStorage.setItem('@lista_favoritos', JSON.stringify(lista));
      // Atualiza a tela imediatamente, sem precisar recarregar do banco
      setProdutosFavoritos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={produtosFavoritos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
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
              onPress={() => removerFavorito(item.id)}
              activeOpacity={0.6}
            >
              <View style={styles.coracaoContainer}>
                <View style={[styles.coracaoParte, styles.coracaoEsquerda, { backgroundColor: '#E91E63' }]} />
                <View style={[styles.coracaoParte, styles.coracaoDireita, { backgroundColor: '#E91E63' }]} />
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        ListEmptyComponent={
          <Text style={styles.text}>Itens que você favoritou aparecerão aqui! ❤︎</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFF7EB',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
       width: 0, 
       height: 2 
    },
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
});
