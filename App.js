
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ImageBackground,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

const MARROM = "#1A0A00";
const DOURADO = "#D4A017";
const CREME = "#FAF0E6";

const produtos = [
  {
    id: "1",
    nome: "Brownie Tradicional",
    descricao: "Chocolate intenso e casquinha crocante",
    preco: 8,
    imagem:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
  },
  {
    id: "2",
    nome: "Brownie com Brigadeiro",
    descricao: "Brownie coberto com brigadeiro cremoso",
    preco: 12,
    imagem:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
  },
  {
    id: "3",
    nome: "Brownie com Morango",
    descricao: "Chocolate com um toque especial",
    preco: 14,
    imagem:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
  },
  {
    id: "4",
    nome: "Caixa de Brownies",
    descricao: "Uma seleção com quatro unidades",
    preco: 28,
    imagem:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
  },
];

export default function App() {
  const [tela, setTela] = useState("inicio");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState("");

  function adicionar(produto) {
    setCarrinho((atual) => {
      const existe = atual.find((item) => item.id === produto.id);

      if (existe) {
        return atual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...atual, { ...produto, quantidade: 1 }];
    });

    Alert.alert("Oba! 🍫", produto.nome + " foi adicionado ao carrinho.");
  }

  function alterarQuantidade(id, valor) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.id === id
            ? { ...item, quantidade: item.quantidade + valor }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );

  const quantidadeTotal = carrinho.reduce(
    (soma, item) => soma + item.quantidade,
    0
  );

  function finalizarPedido() {
    if (carrinho.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione algum doce antes de continuar.");
      return;
    }

    Alert.alert(
      "Pedido demonstrativo! 🍫",
      "Obrigada por escolher a Ouro Doce, " +
        (nome || "cliente") +
        "!\n\nTotal: " +
        total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }) +
        "\n\nEste é um pedido fictício para demonstração do site.",
      [
        {
          text: "Voltar à loja",
          onPress: () => {
            setCarrinho([]);
            setTela("loja");
          },
        },
      ]
    );
  }

  function botao(texto, acao, destaque = false) {
    return (
      <Pressable
        onPress={acao}
        style={[styles.botao, destaque ? styles.botaoDourado : styles.botaoBorda]}
      >
        <Text
          style={[
            styles.textoBotao,
            destaque ? styles.textoEscuro : styles.textoClaro,
          ]}
        >
          {texto}
        </Text>
      </Pressable>
    );
  }

  function cabecalho() {
    return (
      <View style={styles.cabecalho}>
        <Pressable onPress={() => setTela("loja")}>
          <Text style={styles.logo}>✦ OURO DOCE</Text>
          <Text style={styles.sloganPequeno}>UM PEDACINHO DE FELICIDADE</Text>
        </Pressable>

        <Pressable
          style={styles.carrinhoBotao}
          onPress={() => setTela("carrinho")}
        >
          <Text style={styles.carrinhoTexto}>
            🛒 {quantidadeTotal}
          </Text>
        </Pressable>
      </View>
    );
  }

  function campo(label, valor, alterar, dica, seguro = false) {
    return (
      <View style={styles.grupoCampo}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={valor}
          onChangeText={alterar}
          placeholder={dica}
          placeholderTextColor="#9C8B7D"
          secureTextEntry={seguro}
          autoCapitalize={seguro ? "none" : "sentences"}
          keyboardType={label === "E-mail" ? "email-address" : "default"}
          style={styles.input}
        />
      </View>
    );
  }

  function formulario(cadastro) {
    return (
      <ScrollView contentContainerStyle={styles.formulario}>
        <Text style={styles.emojiGrande}>🍫</Text>
        <Text style={styles.titulo}>
          {cadastro ? "Crie sua conta" : "Que bom ter você aqui!"}
        </Text>
        <Text style={styles.subtitulo}>
          {cadastro
            ? "Faça parte da família Ouro Doce."
            : "Entre para descobrir nossos sabores."}
        </Text>

        {cadastro &&
          campo("Seu nome", nome, setNome, "Digite seu nome")}

        {campo("E-mail", email, setEmail, "seuemail@exemplo.com")}
        {campo("Senha", senha, setSenha, "Digite sua senha", true)}

        {botao(cadastro ? "CRIAR MINHA CONTA" : "ENTRAR", () => {
          if (!email.trim() || !senha.trim() || (cadastro && !nome.trim())) {
            Alert.alert("Falta preencher", "Preencha todos os campos.");
            return;
          }

          Alert.alert(
            "Modo demonstração",
            "O acesso é fictício e não cria uma conta real. Vamos conhecer a loja?",
            [{ text: "Entrar na loja", onPress: () => setTela("loja") }]
          );
        }, true)}

        <Pressable
          onPress={() => setTela(cadastro ? "login" : "cadastro")}
          style={styles.linkArea}
        >
          <Text style={styles.linkTexto}>
            {cadastro
              ? "Já tem conta? Entre aqui"
              : "Ainda não tem conta? Cadastre-se"}
          </Text>
        </Pressable>

        <Pressable onPress={() => setTela("loja")}>
          <Text style={styles.voltarTexto}>← Continuar como visitante</Text>
        </Pressable>
      </ScrollView>
    );
  }

  function loja() {
    const filtrados = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
      <ScrollView style={styles.pagina} showsVerticalScrollIndicator={false}>
        {cabecalho()}

        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1000",
          }}
          style={styles.banner}
          imageStyle={{ opacity: 0.42 }}
        >
          <Text style={styles.selo}>FEITO COM AMOR ♡</Text>
          <Text style={styles.tituloBanner}>
            Pequenos doces,{"\n"}grandes momentos.
          </Text>
          <Text style={styles.textoBanner}>
            Brownies artesanais para adoçar o seu dia.
          </Text>
          {botao("VER NOSSOS DOCES ↓", () =>
            setTela("produtos"), true)}
        </ImageBackground>

        <View style={styles.conteudo}>
          <Text style={styles.etiqueta}>NOSSA ESSÊNCIA</Text>
          <Text style={styles.tituloSecao}>Um carinho em cada pedaço</Text>
          <Text style={styles.descricaoSecao}>
            Na Ouro Doce, acreditamos que os melhores momentos ficam ainda
            mais especiais com chocolate. Descubra sabores preparados para
            transformar o seu dia.
          </Text>

          <View style={styles.beneficios}>
            <Text style={styles.beneficio}>🍫 Muito chocolate</Text>
            <Text style={styles.beneficio}>♡ Feito com carinho</Text>
            <Text style={styles.beneficio}>✨ Momentos especiais</Text>
          </View>

          <Text style={styles.etiqueta}>FEITOS PARA VOCÊ</Text>
          <Text style={styles.tituloSecao}>Os queridinhos da casa</Text>

          {produtos.slice(0, 2).map((produto) => (
            <View key={produto.id} style={styles.cardProduto}>
              <Image source={{ uri: produto.imagem }} style={styles.fotoProduto} />
              <View style={styles.infoProduto}>
                <Text style={styles.nomeProduto}>{produto.nome}</Text>
                <Text style={styles.descricaoProduto}>{produto.descricao}</Text>
                <Text style={styles.preco}>
                  {produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </Text>
                {botao("Adicionar ao carrinho +", () => adicionar(produto), true)}
              </View>
            </View>
          ))}

          {botao("VER CARDÁPIO COMPLETO", () => setTela("produtos"), true)}
          {rodape()}
        </View>
      </ScrollView>
    );
  }

  function catalogo() {
    const filtrados = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
      <ScrollView style={styles.pagina}>
        {cabecalho()}
        <View style={styles.conteudo}>
          <Text style={styles.etiqueta}>CARDÁPIO OURO DOCE</Text>
          <Text style={styles.tituloSecao}>Escolha sua felicidade 🍫</Text>
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar um doce..."
            placeholderTextColor="#9C8B7D"
            style={styles.input}
          />

          {filtrados.map((produto) => (
            <View key={produto.id} style={styles.cardProduto}>
              <Image source={{ uri: produto.imagem }} style={styles.fotoProduto} />
              <View style={styles.infoProduto}>
                <Text style={styles.nomeProduto}>{produto.nome}</Text>
                <Text style={styles.descricaoProduto}>{produto.descricao}</Text>
                <Text style={styles.preco}>
                  {produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </Text>
                {botao("Adicionar +", () => adicionar(produto), true)}
              </View>
            </View>
          ))}

          {botao("IR PARA O CARRINHO 🛒", () => setTela("carrinho"), true)}
          {rodape()}
        </View>
      </ScrollView>
    );
  }

  function carrinhoTela() {
    return (
      <ScrollView style={styles.pagina}>
        {cabecalho()}
        <View style={styles.conteudo}>
          <Text style={styles.etiqueta}>SEU PEDIDO</Text>
          <Text style={styles.tituloSecao}>Meu carrinho 🛒</Text>

          {carrinho.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.emojiGrande}>🍫</Text>
              <Text style={styles.nomeProduto}>Seu carrinho está vazio</Text>
              <Text style={styles.descricaoSecao}>
                Que tal escolher um brownie delicioso?
              </Text>
              {botao("ESCOLHER DOCES", () => setTela("produtos"), true)}
            </View>
          ) : (
            <>
              {carrinho.map((item) => (
                <View key={item.id} style={styles.itemCarrinho}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeProduto}>{item.nome}</Text>
                    <Text style={styles.preco}>
                      {(item.preco * item.quantidade).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </Text>
                  </View>
                  <View style={styles.controles}>
                    <Pressable
                      onPress={() => alterarQuantidade(item.id, -1)}
                      style={styles.controle}
                    >
                      <Text style={styles.controleTexto}>−</Text>
                    </Pressable>
                    <Text style={styles.quantidade}>{item.quantidade}</Text>
                    <Pressable
                      onPress={() => alterarQuantidade(item.id, 1)}
                      style={styles.controle}
                    >
                      <Text style={styles.controleTexto}>+</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              <View style={styles.resumo}>
                <Text style={styles.textoTotal}>Total do pedido</Text>
                <Text style={styles.total}>
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </Text>
              </View>
              {botao("FINALIZAR PEDIDO", finalizarPedido, true)}
            </>
          )}

          {botao("CONTINUAR COMPRANDO", () => setTela("produtos"))}
          {rodape()}
        </View>
      </ScrollView>
    );
  }

  function rodape() {
    return (
      <View style={styles.rodape}>
        <Text style={styles.logo}>✦ OURO DOCE</Text>
        <Text style={styles.rodapeTexto}>Um pedacinho de felicidade.</Text>
        <Text style={styles.rodapeTexto}>
          Loja fictícia para fins de demonstração.
        </Text>
      </View>
    );
  }

  if (tela === "inicio") {
    return (
      <SafeAreaView style={styles.inicio}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1000",
          }}
          style={styles.imagemInicio}
          imageStyle={{ opacity: 0.58 }}
        >
          <View style={styles.sombraInicio} />
          <View style={styles.painelInicio}>
            <Text style={styles.logoInicio}>✦ OURO DOCE</Text>
            <Text style={styles.sloganInicio}>UM PEDACINHO DE FELICIDADE</Text>
            <View style={styles.linhaDourada} />
            <Text style={styles.tituloInicio}>
              Bem-vindo(a) à{"\n"}
              <Text style={{ color: DOURADO }}>Ouro Doce</Text>
            </Text>
            <Text style={styles.textoInicio}>
              Brownies artesanais feitos com amor e os melhores ingredientes.
            </Text>

            {botao("Entrar na minha conta", () => setTela("login"), true)}
            {botao("Criar conta grátis", () => setTela("cadastro"))}

            <Pressable onPress={() => setTela("loja")}>
              <Text style={styles.visitante}>Continuar como visitante →</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (tela === "login") {
    return <SafeAreaView style={styles.inicio}>{formulario(false)}</SafeAreaView>;
  }

  if (tela === "cadastro") {
    return <SafeAreaView style={styles.inicio}>{formulario(true)}</SafeAreaView>;
  }

  if (tela === "produtos") return catalogo();
  if (tela === "carrinho") return carrinhoTela();

  return loja();
}

const styles = StyleSheet.create({
  inicio: {
    flex: 1,
    backgroundColor: MARROM,
  },
  imagemInicio: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: MARROM,
  },
  sombraInicio: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,10,0,0.50)",
  },
  painelInicio: {
    backgroundColor: "rgba(26,10,0,0.93)",
    paddingHorizontal: 27,
    paddingTop: 28,
    paddingBottom: 35,
  },
  logoInicio: {
    color: DOURADO,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  sloganInicio: {
    color: "#E7D4B8",
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 7,
  },
  linhaDourada: {
    width: 55,
    height: 3,
    backgroundColor: DOURADO,
    alignSelf: "center",
    marginVertical: 24,
  },
  tituloInicio: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  textoInicio: {
    fontSize: 14,
    lineHeight: 22,
    color: "#D6C8BB",
    textAlign: "center",
    marginTop: 13,
    marginBottom: 22,
  },
  botao: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },
  botaoDourado: {
    backgroundColor: DOURADO,
  },
  botaoBorda: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#806C56",
  },
  textoBotao: {
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
  },
  textoEscuro: {
    color: MARROM,
  },
  textoClaro: {
    color: "#FFFFFF",
  },
  visitante: {
    textAlign: "center",
    color: "#D6C8BB",
    paddingTop: 23,
    fontSize: 14,
  },
  pagina: {
    flex: 1,
    backgroundColor: CREME,
  },
  cabecalho: {
    backgroundColor: MARROM,
    paddingHorizontal: 20,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: DOURADO,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 2,
  },
  sloganPequeno: {
    color: "#E7D4B8",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 4,
  },
  carrinhoBotao: {
    backgroundColor: "#392215",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
  },
  carrinhoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  banner: {
    minHeight: 330,
    padding: 25,
    justifyContent: "center",
    backgroundColor: MARROM,
  },
  selo: {
    color: DOURADO,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  tituloBanner: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "900",
    marginTop: 15,
  },
  textoBanner: {
    color: "#F1E5D7",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 12,
  },
  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },
  etiqueta: {
    color: "#A67812",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 18,
    marginBottom: 8,
  },
  tituloSecao: {
    color: MARROM,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 33,
    marginBottom: 12,
  },
  descricaoSecao: {
    color: "#715E4F",
    fontSize: 14,
    lineHeight: 23,
  },
  beneficios: {
    backgroundColor: "#F1E2CE",
    padding: 15,
    borderRadius: 14,
    marginVertical: 23,
    gap: 12,
  },
  beneficio: {
    color: MARROM,
    fontSize: 14,
    fontWeight: "700",
  },
  cardProduto: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    overflow: "hidden",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#EADCCB",
  },
  fotoProduto: {
    width: "100%",
    height: 190,
    backgroundColor: "#E8D6C3",
  },
  infoProduto: {
    padding: 17,
  },
  nomeProduto: {
    color: MARROM,
    fontSize: 18,
    fontWeight: "900",
  },
  descricaoProduto: {
    color: "#806E5D",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  preco: {
    color: "#A67812",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 12,
  },
  formulario: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: CREME,
  },
  emojiGrande: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 15,
  },
  titulo: {
    color: MARROM,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitulo: {
    color: "#806E5D",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 25,
  },
  grupoCampo: {
    marginBottom: 15,
  },
  label: {
    color: MARROM,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2D1BF",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: MARROM,
    marginBottom: 12,
  },
  linkArea: {
    paddingVertical: 19,
  },
  linkTexto: {
    color: "#966C0D",
    fontWeight: "800",
    textAlign: "center",
  },
  voltarTexto: {
    color: "#806E5D",
    textAlign: "center",
    paddingVertical: 12,
  },
  vazio: {
    alignItems: "center",
    paddingVertical: 35,
  },
  itemCarrinho: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginVertical: 7,
    gap: 10,
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  controle: {
    backgroundColor: "#F1E2CE",
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  controleTexto: {
    color: MARROM,
    fontSize: 21,
    fontWeight: "900",
  },
  quantidade: {
    color: MARROM,
    fontSize: 16,
    fontWeight: "800",
  },
  resumo: {
    borderTopWidth: 1,
    borderColor: "#E2D1BF",
    paddingTop: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textoTotal: {
    color: MARROM,
    fontSize: 16,
    fontWeight: "800",
  },
  total: {
    color: "#966C0D",
    fontSize: 23,
    fontWeight: "900",
  },
  rodape: {
    backgroundColor: MARROM,
    borderRadius: 15,
    padding: 22,
    alignItems: "center",
    marginTop: 30,
  },
  rodapeTexto: {
    color: "#D6C8BB",
    fontSize: 12,
    textAlign: "center",
    marginTop: 9,
  },
});
