import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './LoginScreen';
import EsqueciSenhaScreen from'./EsqueciSenhaScreen';
import CadastroScreen from './CadastroScreen';
import HomeScreen from './HomeScreen';
import EnviarScreen from './EnviarScreen';
import FavoritosScreen from './FavoritosScreen';
import MinhaContaScreen from './MinhaContaScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Inicializa os mecanismos de navegação (Tab e Stack)
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//Componente das abas
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Define qual ícone mostrar dependendo da aba ativa
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Enviar') iconName = 'arrow-up-circle';
          else if (route.name === 'Minha Conta') iconName = 'person-circle';
          else if (route.name === 'Favoritos') iconName = 'heart-sharp';
          // Retorna o componente de ícone visual
          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
    {/* Telas que aparecem dentro do menu de abas*/} 
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Enviar" component={EnviarScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
      <Tab.Screen name="Minha Conta" component={MinhaContaScreen} />
    </Tab.Navigator>
  );
}

//Componente principal que decide se mostra o Login ou o App logado
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* As telas aparecem sozinhas, sem barras*/}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />

       {/* Quando o usuário logar, navega para 'MainApp'*/}
        <Stack.Screen name="MainApp" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

