import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from './BancodeDados';

const CATEGORIAS = [
  'Hardware / Componentes',
  'Periféricos',
  'Smartphones e Tablets',
  'Consoles e Jogos',
  'Áudio e Vídeo',
];

export default function EnviarScreen({ navigation }) {
  const [newItem, setNewItem] = useState({
    name: '',
    descricao: '',
    price: '',
    store: '',
    category: '',
    image: null,
  });

  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const formatarData = (date) => {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatarPreco = (texto) => {
    const apenasNumeros = texto.replace(/\D/g, '');
    const valor = (parseInt(apenasNumeros || '0') / 100).toFixed(2);
    return valor.replace('.', ',');
  };

   // Abre a galeria para o usuário escolher uma imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setNewItem({ ...newItem, image: result.assets[0].uri });
    }
  };

  const submitOffer = async () => {
    if (!newItem.name || !newItem.price || !newItem.descricao || !newItem.store || !newItem.category || !newItem.image) {
      Alert.alert('Erro', 'Preencha todos os campos e selecione uma imagem.');
      return;
    }

    try {
       // Converte a imagem URI em ArrayBuffer para enviar ao Storage
      const response = await fetch(newItem.image);
      const blob = await response.blob();
      const fileName = `${Date.now()}.jpg`;
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

      if (uploadError) {
        Alert.alert('Erro no upload', 'Ocorreu um erro no upload');
        return;
      }

      const { data: urlData } = supabase.storage.from('imagens').getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('produtos')
        .insert([{
          nome: newItem.name,
          preco: parseFloat(newItem.price.replace(',', '.')) || 0,
          descricao: newItem.descricao,
          store: newItem.store,
          category: newItem.category,
          image: urlData.publicUrl,
          data: formatarData(data),
          hora: formatarHora(hora),
        }]);

      if (insertError) {
        Alert.alert('Erro ao salvar', 'Erro ao salvar imagem');
        return;
      }

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
      setNewItem({ name: '', descricao: '', price: '', store: '', category: '', image: null });
      setData(new Date());
      setHora(new Date());

    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Cadastrar Oferta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        placeholderTextColor="#999"
        value={newItem.name}
        onChangeText={text => setNewItem({ ...newItem, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Descrição/Modelo"
        placeholderTextColor="#999"
        value={newItem.descricao}
        onChangeText={text => setNewItem({ ...newItem, descricao: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="R$ 0,00"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={newItem.price ? `R$ ${newItem.price}` : ''}
        onChangeText={text => {
          const formatado = formatarPreco(text);
          setNewItem({ ...newItem, price: formatado });
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Loja/Local"
        placeholderTextColor="#999"
        value={newItem.store}
        onChangeText={text => setNewItem({ ...newItem, store: text })}
      />

      {/* Data e Hora lado a lado */}
      <View style={styles.dataHoraRow}>
        <View style={styles.dataHoraItem}>
          <Text style={styles.dataHoraLabel}>📅 Data</Text>
          <TouchableOpacity style={styles.dataHoraButton} onPress={() => setMostrarData(true)}>
            <Text style={styles.dataHoraTexto}>{formatarData(data)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dataHoraItem}>
          <Text style={styles.dataHoraLabel}>🕐 Hora</Text>
          <TouchableOpacity style={styles.dataHoraButton} onPress={() => setMostrarHora(true)}>
            <Text style={styles.dataHoraTexto}>{formatarHora(hora)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setMostrarData(false);
            if (selectedDate) setData(selectedDate);
          }}
        />
      )}

      {mostrarHora && (
        <DateTimePicker
          value={hora}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setMostrarHora(false);
            if (selectedTime) setHora(selectedTime);
          }}
        />
      )}

      {/* Botão que abre o modal de seleção de categoria */}
      <Text style={styles.dataHoraLabel}>🏷️ Categoria</Text>
      <TouchableOpacity
        style={[styles.input, styles.categoriaButton]}
        onPress={() => setMostrarCategorias(true)}
      >
        <Text style={newItem.category ? styles.categoriaTextoSelecionado : styles.categoriaPlaceholder}>
          {newItem.category || 'Selecionar categoria...'}
        </Text>
        <Text style={styles.categoriaSetinha}>▼</Text>
      </TouchableOpacity>

      {/* Modal de categorias */}
      <Modal
        visible={mostrarCategorias}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarCategorias(false)}
      >
        {/* Toque fora do modal fecha ele */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMostrarCategorias(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Selecione a Categoria</Text>
            <FlatList
              data={CATEGORIAS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    newItem.category === item && styles.modalItemSelecionado,
                  ]}
                  onPress={() => {
                    setNewItem({ ...newItem, category: item });
                    setMostrarCategorias(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemTexto,
                    newItem.category === item && styles.modalItemTextoSelecionado,
                  ]}>
                    {item}
                  </Text>
                  {newItem.category === item && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
        <Text style={styles.uploadText}>
          {newItem.image ? '✓ Imagem Selecionada' : '📷 Upload de Foto do Produto'}
        </Text>
      </TouchableOpacity>

      {/* Preview da imagem selecionada */}
      {newItem.image && <Image source={{ uri: newItem.image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.botaoPublicar} onPress={submitOffer}>
        <Text style={styles.botaoPublicarTexto}>Publicar na Rede</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  dataHoraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  dataHoraItem: {
    flex: 1,
  },
  dataHoraLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  dataHoraButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  dataHoraTexto: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoriaButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriaPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  categoriaTextoSelecionado: {
    color: '#333',
    fontSize: 14,
  },
  categoriaSetinha: {
    color: '#999',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  // Caixa branca que sobe de baixo com as opções
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemSelecionado: {
    backgroundColor: '#FFF3E0',
  },
  modalItemTexto: {
    fontSize: 15,
    color: '#333',
  },
  modalItemTextoSelecionado: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  modalCheckmark: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#555',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  botaoPublicar: {
    backgroundColor: '#2088f7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoPublicarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
