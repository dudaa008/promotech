# 📱 ProMoTech

Aplicativo mobile onde usuários compartilham fotos de produtos de tecnologia que compraram, junto com o preço e onde compraram — permitindo que outros usuários pesquisem preços antes de decidir uma compra.

## Sobre o projeto

Projeto desenvolvido em grupo, dentro da disciplina de Programação para Dispositivos Móveis Android. Construído em React Native, integrado ao Supabase, inteiramente pelo editor Snack do Expo.

## Funcionalidades

- Cadastro e login de usuário
- Recuperação de senha ("Esqueci minha senha")
- Postagem de produtos: foto, loja onde comprou e preço pago
- Tela inicial com os produtos postados pela comunidade
- Favoritar produtos de interesse
- Perfil / Minha Conta

## Tecnologias

- React Native (via Expo Snack)
- Supabase (autenticação e banco de dados)
- JavaScript

## Estrutura do projeto

```
App.js                    # Ponto de entrada / navegação
LoginScreen.js             # Tela de login
CadastroScreen.js           # Cadastro de usuário
EsqueciSenhaScreen.js        # Recuperação de senha
HomeScreen.js                 # Feed de produtos postados
EnviarScreen.js                # Postar novo produto (foto + preço + loja)
FavoritosScreen.js              # Produtos favoritados
MinhaContaScreen.js              # Perfil do usuário
BancodeDados.js                   # Integração com o banco de dados (Supabase)
```

## Como rodar

Este projeto foi desenvolvido no [Expo Snack](https://snack.expo.dev). Para rodar localmente:

```bash
npm install
npx expo start
```

Escaneie o QR Code com o app Expo Go (Android/iOS) para visualizar no celular.

## Observações

Projeto acadêmico com o objetivo de ajudar usuários a pesquisar preços de produtos de tecnologia através de informações compartilhadas pela própria comunidade.
