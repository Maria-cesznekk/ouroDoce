
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
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";

const IP_DO_ESP = "http://192.168.1.100/pedido";
// Troque pelo IP completo mostrado no Monitor Serial do ESP32.

const BROWN = "#1C0A00";
const ORANGE = "#D96B27";
const AMBER = "#D4A017";
const BG = "#FAF0E6";
const CARD_BG = "#FFFFFF";

const FOTO_BROWNIE =
  "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700";

const PRODUCTS = [
  { id: "1", category: "Brownies", nome: "Brownie Tradicional", descricao: "Chocolate intenso e casquinha crocante.", preco: 8, maisVendido: true },
  { id: "2", category: "Brownies", nome: "Brownie com Brigadeiro", descricao: "Brownie coberto com brigadeiro cremoso.", preco: 12 },
  { id: "3", category: "Brownies", nome: "Brownie com Morango", descricao: "Chocolate com morangos frescos.", preco: 14 },
  { id: "4", category: "Recheados", nome: "Brownie Ninho com Nutella", descricao: "Recheio duplo cremoso.", preco: 19, maisVendido: true },
  { id: "5", category: "Recheados", nome: "Brownie de Pistache", descricao: "Pasta de pistache e pistaches caramelizados.", preco: 20, maisVendido: true },
  { id: "6", category: "Recheados", nome: "Brownie Ninho", descricao: "Leite Ninho e ganache de leite condensado.", preco: 17 },
  { id: "7", category: "Recheados", nome: "Brownie Ouro Branco", descricao: "Chocolate branco e pedaços de Ouro Branco.", preco: 18 },
  { id: "8", category: "Recheados", nome: "Brownie Kinder Bueno", descricao: "Creme e wafers Kinder Bueno.", preco: 21, maisVendido: true },
  { id: "9", category: "Recheados", nome: "Brownie Ovomaltine", descricao: "Cobertura cremosa e crocante.", preco: 18 },
  { id: "10", category: "Combos", nome: "Caixa de Brownies", descricao: "Seleção especial com quatro unidades.", preco: 28 },
  { id: "11", category: "Combos", nome: "Combo Ouro", descricao: "3 Brownies Tradicionais + 3 Brownies Ouro + 2 bebidas.", preco: 65 },
  { id: "12", category: "Combos", nome: "Combo Duplo Especial", descricao: "Brownie Ninho com Nutella + Brownie de Morango + 2 bebidas.", preco: 42 },
  { id: "13", category: "Bebidas", nome: "Café Expresso", descricao: "Café encorpado.", preco: 6 },
  { id: "14", category: "Bebidas", nome: "Chocolate Quente", descricao: "Chocolate quente cremoso.", preco: 12 },
];

const EXTRAS = [
  { id: "a1", nome: "Pasta de Pistache", preco: 5 },
  { id: "a2", nome: "Leite Ninho", preco: 3 },
  { id: "a3", nome: "Nutella Extra", preco: 4 },
  { id: "a4", nome: "Ouro Branco Triturado", preco: 4 },
  { id: "a5", nome: "Kinder Bueno Triturado", preco: 5 },
  { id: "a6", nome: "Ovomaltine Crocante", preco: 3 },
  { id: "a7", nome: "Calda de Chocolate", preco: 2 },
  { id: "a8", nome: "Calda de Morango", preco: 2 },
];

const TABS = ["Brownies", "Recheados", "Combos", "Bebidas"];

const dinheiro = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [userMode, setUserMode] = useState("guest");
  const [currentUser, setCurrentUser] = useState(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [activeTab, setActiveTab] = useState("Brownies");
  const [busca, setBusca] = useState("");

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);

  const [massaMonte, setMassaMonte] = useState("Chocolate Meio Amargo");
  const [recheioMonte, setRecheioMonte] = useState("Nutella");
  const [coberturaMonte, setCoberturaMonte] = useState("Leite Ninho");

  const [carrinho, setCarrinho] = useState([]);
  const [points, setPoints] = useState(0);
  const [shareCode, setShareCode] = useState(null);
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [enviandoEsp, setEnviandoEsp] = useState(false);

  const cartCount = carrinho.reduce(
    (soma, item) => soma + item.quantidade,
    0
  );

  const totalCarrinho = carrinho.reduce(
    (soma, item) => soma + item.precoFinal * item.quantidade,
    0
  );

  const pontosGanhos = Math.floor(totalCarrinho);

  function voltar() {
    setMensagem("");
    setScreen("home");
  }

  function handleAuth(isCadastro) {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || !senha.trim() || (isCadastro && !nome.trim())) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(emailLimpo)) {
      setMensagem("Digite um e-mail válido.");
      return;
    }

    if (senha.length < 4) {
      setMensagem("A senha precisa ter pelo menos 4 caracteres.");
      return;
    }

    if (isCadastro) {
      setCurrentUser({
        nome: nome.trim(),
        email: emailLimpo,
        senha,
      });
      setUserMode("logged");
      setPoints(15);
      setMensagem("");
      setScreen("home");
      return;
    }

    if (
      currentUser &&
      currentUser.email === emailLimpo &&
      currentUser.senha === senha
    ) {
      setUserMode("logged");
      setMensagem("");
      setScreen("home");
    } else if (!currentUser) {
      setCurrentUser({
        nome: emailLimpo.split("@")[0],
        email: emailLimpo,
        senha,
      });
      setUserMode("logged");
      setMensagem("");
      setScreen("home");
    } else {
      setMensagem("E-mail ou senha incorretos.");
    }
  }

  function handleLogout() {
    setShowLogoutModal(false);
    setUserMode("guest");
    setCurrentUser(null);
    setScreen("welcome");
  }

  function abrirDetalhes(produto) {
    setProdutoSelecionado(produto);
    setExtrasSelecionados([]);
  }

  function alternarExtra(extra) {
    setExtrasSelecionados((atual) =>
      atual.some((e) => e.id === extra.id)
        ? atual.filter((e) => e.id !== extra.id)
        : [...atual, extra]
    );
  }

  function adicionarAoCarrinho(produto, extras = []) {
    const somaExtras = extras.reduce((s, e) => s + e.preco, 0);
    const precoFinal = produto.preco + somaExtras;
    const nomesExtras = extras.map((e) => e.nome).join(", ");
    const chave = produto.id + "-" + nomesExtras;

    setCarrinho((atual) => {
      const existe = atual.find((item) => item.chave === chave);

      if (existe) {
        return atual.map((item) =>
          item.chave === chave
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [
        ...atual,
        {
          chave,
          id: produto.id,
          nome: produto.nome,
          extras: nomesExtras,
          precoFinal,
          quantidade: 1,
        },
      ];
    });

    setProdutoSelecionado(null);
    setExtrasSelecionados([]);
    setMensagem("Produto adicionado ao carrinho!");
    setTimeout(() => setMensagem(""), 2000);
  }

  function adicionarBrownieMontado() {
    const produto = {
      id: "monte",
      nome: "Brownie Personalizado",
      preco: 22,
    };

    const extras = [
      { nome: "Massa: " + massaMonte, preco: 0 },
      { nome: "Recheio: " + recheioMonte, preco: 0 },
      { nome: "Cobertura: " + coberturaMonte, preco: 0 },
    ];

    adicionarAoCarrinho(produto, extras);
    setScreen("cart");
  }

  function alterarQuantidade(chave, delta) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.chave === chave
            ? { ...item, quantidade: item.quantidade + delta }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function gerarCodigoCompartilhamento() {
    const codigo =
      "OD-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    setShareCode(codigo);

    Alert.alert(
      "Código do carrinho",
      "Seu código é " + codigo + ". Compartilhe com quem quiser!"
    );
  }

  async function placeOrder() {
    if (carrinho.length === 0 || enviandoEsp) return;

    const numeroPedido = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    const pedidoPayload = {
      numero: numeroPedido,
      cliente:
        userMode === "logged" && currentUser
          ? currentUser.nome
          : "Visitante",
      total: totalCarrinho,
      pontosGanhos,
      data: new Date().toLocaleString("pt-BR"),
      itens: carrinho.map((item) => ({
        nome: item.extras
          ? `${item.nome} (${item.extras})`
          : item.nome,
        quantidade: item.quantidade,
        preco: item.precoFinal,
      })),
    };

    setEnviandoEsp(true);
    setMensagem("Enviando pedido...");

    try {
      const resposta = await fetch(IP_DO_ESP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoPayload),
      });

      if (!resposta.ok) {
        throw new Error("O ESP32 não confirmou o pedido.");
      }

      concluirPedidoLocal(pedidoPayload, true);
    } catch (erro) {
      concluirPedidoLocal(pedidoPayload, false);
    } finally {
      setEnviandoEsp(false);
    }
  }

  function concluirPedidoLocal(pedido, enviadoAoHardware) {
    if (userMode === "logged") {
      setPoints((p) => p + pedido.pontosGanhos);
    }

    setShareCode(null);
    setUltimoPedido({
      ...pedido,
      enviadoAoHardware,
    });
    setCarrinho([]);
    setMensagem("");
    setScreen("success");
  }

  function Header({ titulo, voltarPara = "home" }) {
    return (
      <View style={styles.appHeader}>
        <Pressable onPress={() => setScreen(voltarPara)}>
          <Text style={styles.backBtn}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{titulo}</Text>
        <View style={{ width: 55 }} />
      </View>
    );
  }

  function BottomNav() {
    const abas = [
      { id: "home", label: "Início" },
      { id: "cardapio", label: "Cardápio" },
      { id: "monte", label: "Monte o Seu" },
      { id: "profile", label: "Perfil" },
    ];

    return (
      <View style={styles.bottomNav}>
        {abas.map((aba) => (
          <Pressable
            key={aba.id}
            onPress={() => setScreen(aba.id)}
            style={styles.navItem}
          >
            <View
              style={[
                styles.navDot,
                screen === aba.id && styles.navDotActive,
              ]}
            />
            <Text
              style={[
                styles.navText,
                screen === aba.id && styles.navTextActive,
              ]}
            >
              {aba.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function Toast() {
    if (!mensagem) return null;

    return (
      <View style={styles.toast}>
        <Text style={styles.toastText}>{mensagem}</Text>
      </View>
    );
  }

  function ProductCard({ produto }) {
    return (
      <Pressable
        style={styles.productCard}
        onPress={() => abrirDetalhes(produto)}
      >
        <Image source={{ uri: FOTO_BROWNIE }} style={styles.productImg} />
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{produto.category}</Text>
          <Text style={styles.productName}>{produto.nome}</Text>
          <Text style={styles.productDesc}>{produto.descricao}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>
              {dinheiro(produto.preco)}
            </Text>
            <Text style={styles.addSmallBtnText}>+ Adicionar</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  function ProductDrawer() {
    if (!produtoSelecionado) return null;

    const somaExtras = extrasSelecionados.reduce(
      (s, e) => s + e.preco,
      0
    );

    return (
      <Modal
        visible={!!produtoSelecionado}
        transparent
        animationType="slide"
        onRequestClose={() => setProdutoSelecionado(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalOutside}
            onPress={() => setProdutoSelecionado(null)}
          />
          <View style={styles.drawerBox}>
            <Image
              source={{ uri: FOTO_BROWNIE }}
              style={styles.drawerImage}
            />
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                {produtoSelecionado.nome}
              </Text>
              <Pressable onPress={() => setProdutoSelecionado(null)}>
                <Text style={styles.closeDrawer}>Fechar</Text>
              </Pressable>
            </View>

            <Text style={styles.productDesc}>
              {produtoSelecionado.descricao}
            </Text>

            <Text style={styles.drawerSubtitle}>
              Escolha seus adicionais
            </Text>

            <ScrollView style={{ maxHeight: 210 }}>
              {EXTRAS.map((extra) => {
                const marcado = extrasSelecionados.some(
                  (e) => e.id === extra.id
                );

                return (
                  <Pressable
                    key={extra.id}
                    onPress={() => alternarExtra(extra)}
                    style={[
                      styles.extraRow,
                      marcado && styles.extraRowActive,
                    ]}
                  >
                    <Text style={styles.optionText}>
                      {marcado ? "✓ " : "+ "}
                      {extra.nome}
                    </Text>
                    <Text style={styles.optionText}>
                      {dinheiro(extra.preco)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.drawerTotal}>
              Total: {dinheiro(produtoSelecionado.preco + somaExtras)}
            </Text>

            <Pressable
              style={styles.btnPrimary}
              onPress={() =>
                adicionarAoCarrinho(
                  produtoSelecionado,
                  extrasSelecionados
                )
              }
            >
              <Text style={styles.btnPrimaryText}>
                Adicionar ao carrinho
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  // TELA DE BOAS-VINDAS
  if (screen === "welcome") {
    return (
      <ImageBackground
        source={{ uri: FOTO_BROWNIE }}
        style={styles.welcomeImage}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeOverlay} />
        <View style={styles.welcomePanel}>
          <Text style={styles.brandTag}>DOCES MOMENTOS</Text>
          <Text style={styles.welcomeTitle}>Ouro Doce</Text>
          <Text style={styles.welcomeSub}>
            Brownies feitos para transformar pequenos momentos em grandes
            lembranças.
          </Text>

          <Pressable
            style={styles.btnPrimary}
            onPress={() => setScreen("login")}
          >
            <Text style={styles.btnPrimaryText}>Entrar</Text>
          </Pressable>

          <Pressable
            style={styles.btnOutline}
            onPress={() => setScreen("register")}
          >
            <Text style={styles.btnOutlineText}>Criar minha conta</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setUserMode("guest");
              setScreen("home");
            }}
          >
            <Text style={styles.guestLink}>Continuar como visitante</Text>
          </Pressable>
        </View>
      </ImageBackground>
    );
  }

  // LOGIN E CADASTRO
  if (screen === "login" || screen === "register") {
    const isCadastro = screen === "register";

    return (
      <SafeAreaView style={styles.screenBg}>
        <StatusBar barStyle="dark-content" />
        <Header titulo={isCadastro ? "Criar conta" : "Entrar"} voltarPara="welcome" />

        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authWelcome}>
            {isCadastro ? "Bem-vindo à Ouro Doce!" : "Que bom ter você aqui!"}
          </Text>

          {isCadastro && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                value={nome}
                onChangeText={setNome}
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          {!!mensagem && (
            <Text style={styles.errorText}>{mensagem}</Text>
          )}

          <Pressable
            style={styles.btnPrimary}
            onPress={() => handleAuth(isCadastro)}
          >
            <Text style={styles.btnPrimaryText}>
              {isCadastro ? "Cadastrar" : "Entrar"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMensagem("");
              setScreen(isCadastro ? "login" : "register");
            }}
          >
            <Text style={styles.switchAuthText}>
              {isCadastro
                ? "Já tem conta? Faça login"
                : "Não tem conta? Cadastre-se"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // TELA INICIAL
  if (screen === "home") {
    const maisVendidos = PRODUCTS.filter((p) => p.maisVendido);

    return (
      <SafeAreaView style={styles.screenBg}>
        <StatusBar barStyle="light-content" />
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.brandSerif}>Ouro Doce</Text>
            <Text style={styles.brandGoldSub}>
              {userMode === "logged"
                ? `Olá, ${currentUser?.nome || ""}!`
                : "Bem-vindo, visitante"}
            </Text>
          </View>

          <Pressable
            style={styles.iconBox}
            onPress={() => setScreen("cart")}
          >
            <Text style={styles.iconLabel}>Carrinho ({cartCount})</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Toast />

          <Text style={styles.sectionTitle}>Explore nosso cardápio</Text>

          <View style={styles.categoriesGrid}>
            {TABS.map((cat) => (
              <Pressable
                key={cat}
                style={styles.categoryCard}
                onPress={() => {
                  setActiveTab(cat);
                  setBusca("");
                  setScreen("cardapio");
                }}
              >
                <Text style={styles.categoryTitle}>{cat}</Text>
                <Text style={styles.categoryAction}>Ver produtos →</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.monteBanner}
            onPress={() => setScreen("monte")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.monteTag}>DO SEU JEITO</Text>
              <Text style={styles.monteTitle}>Monte seu Brownie</Text>
              <Text style={styles.monteDesc}>
                Escolha a massa, o recheio e a cobertura.
              </Text>
            </View>
            <Text style={styles.monteArrow}>›</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Mais vendidos</Text>

          {maisVendidos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </ScrollView>

        <BottomNav />
        <ProductDrawer />
      </SafeAreaView>
    );
  }

  // CARDÁPIO E BUSCA
  if (screen === "cardapio") {
    const filtrados = PRODUCTS.filter((p) => {
      const bateCategoria = p.category === activeTab;
      const bateBusca = p.nome
        .toLowerCase()
        .includes(busca.toLowerCase());

      return busca.trim() ? bateBusca : bateCategoria;
    });

    return (
      <SafeAreaView style={styles.screenBg}>
        <StatusBar barStyle="light-content" />
        <View style={styles.homeHeader}>
          <Text style={styles.headerTitle}>Cardápio</Text>
          <Pressable
            style={styles.iconBox}
            onPress={() => setScreen("cart")}
          >
            <Text style={styles.iconLabel}>Carrinho ({cartCount})</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar brownie..."
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {!busca.trim() && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabPill,
                  activeTab === tab && styles.tabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Toast />
          {filtrados.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum produto encontrado.
            </Text>
          ) : (
            filtrados.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))
          )}
        </ScrollView>

        <BottomNav />
        <ProductDrawer />
      </SafeAreaView>
    );
  }

  // MONTE SEU BROWNIE
  if (screen === "monte") {
    const grupos = [
      {
        titulo: "1. Escolha a massa",
        opcoes: [
          ["Chocolate Meio Amargo", massaMonte, setMassaMonte],
          ["Chocolate ao Leite", massaMonte, setMassaMonte],
          ["Black Cacau", massaMonte, setMassaMonte],
        ],
      },
      {
        titulo: "2. Escolha o recheio",
        opcoes: [
          ["Nutella", recheioMonte, setRecheioMonte],
          ["Leite Ninho", recheioMonte, setRecheioMonte],
          ["Pistache", recheioMonte, setRecheioMonte],
          ["Brigadeiro Belga", recheioMonte, setRecheioMonte],
          ["Ouro Branco", recheioMonte, setRecheioMonte],
        ],
      },
      {
        titulo: "3. Escolha a cobertura",
        opcoes: [
          ["Leite Ninho", coberturaMonte, setCoberturaMonte],
          ["Calda de Chocolate", coberturaMonte, setCoberturaMonte],
          ["Calda de Morango", coberturaMonte, setCoberturaMonte],
          ["Ovomaltine Crocante", coberturaMonte, setCoberturaMonte],
        ],
      },
    ];

    return (
      <SafeAreaView style={styles.screenBg}>
        <Header titulo="Monte seu Brownie" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={{ uri: FOTO_BROWNIE }}
            style={styles.builderImage}
          />

          <Text style={styles.sectionTitle}>
            Crie uma combinação especial!
          </Text>

          {grupos.map((grupo) => (
            <View key={grupo.titulo}>
              <Text style={styles.sectionTitle}>{grupo.titulo}</Text>
              {grupo.opcoes.map(([opcao, selecionado, setSelecionado]) => (
                <Pressable
                  key={opcao}
                  onPress={() => setSelecionado(opcao)}
                  style={[
                    styles.optionRow,
                    selecionado === opcao && styles.optionRowActive,
                  ]}
                >
                  <Text style={styles.optionText}>{opcao}</Text>
                  <Text style={styles.radio}>
                    {selecionado === opcao ? "●" : "○"}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTotal}>R$ 22,00</Text>
            <Text style={styles.productDesc}>
              Brownie personalizado
            </Text>
          </View>

          <Pressable
            style={styles.btnPrimary}
            onPress={adicionarBrownieMontado}
          >
            <Text style={styles.btnPrimaryText}>
              Adicionar ao carrinho
            </Text>
          </Pressable>
        </ScrollView>
        <BottomNav />
      </SafeAreaView>
    );
  }

  // CARRINHO E REVISÃO
  if (screen === "cart" || screen === "review") {
    const isReview = screen === "review";

    return (
      <SafeAreaView style={styles.screenBg}>
        <Header
          titulo={isReview ? "Revisar pedido" : "Meu carrinho"}
          voltarPara={isReview ? "cart" : "cardapio"}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {carrinho.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.sectionTitle}>Seu carrinho está vazio.</Text>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => setScreen("cardapio")}
              >
                <Text style={styles.btnPrimaryText}>Ver cardápio</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {carrinho.map((item) => (
                <View key={item.chave} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.nome}</Text>
                    {!!item.extras && (
                      <Text style={styles.extrasText}>{item.extras}</Text>
                    )}
                    <Text style={styles.productPrice}>
                      {dinheiro(item.precoFinal * item.quantidade)}
                    </Text>
                  </View>

                  {!isReview && (
                    <View style={styles.qtyControls}>
                      <Pressable
                        onPress={() => alterarQuantidade(item.chave, -1)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </Pressable>

                      <Text style={styles.qtyValue}>
                        {item.quantidade}
                      </Text>

                      <Pressable
                        onPress={() => alterarQuantidade(item.chave, 1)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}

              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryTotal}>
                    {dinheiro(totalCarrinho)}
                  </Text>
                </View>
              </View>

              {isReview && (
                <View style={styles.pointsBanner}>
                  <Text style={styles.pointsBannerTitle}>
                    Pontos deste pedido
                  </Text>
                  <Text style={styles.pointsBannerText}>
                    {userMode === "logged"
                      ? `Você ganhará ${pontosGanhos} pontos!`
                      : "Entre na sua conta para acumular pontos."}
                  </Text>
                </View>
              )}

              <Pressable
                style={styles.shareBtn}
                onPress={gerarCodigoCompartilhamento}
              >
                <Text style={styles.shareBtnText}>
                  {shareCode
                    ? `Código: ${shareCode}`
                    : "Compartilhar carrinho"}
                </Text>
              </Pressable>

              {!!mensagem && (
                <Text style={styles.errorText}>{mensagem}</Text>
              )}

              {!isReview ? (
                <Pressable
                  style={styles.btnPrimary}
                  onPress={() => setScreen("review")}
                >
                  <Text style={styles.btnPrimaryText}>
                    Revisar pedido
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[
                    styles.btnPrimary,
                    enviandoEsp && { opacity: 0.6 },
                  ]}
                  disabled={enviandoEsp}
                  onPress={placeOrder}
                >
                  {enviandoEsp ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>
                      Confirmar pedido
                    </Text>
                  )}
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // CONFIRMAÇÃO DO PEDIDO
  if (screen === "success" && ultimoPedido) {
    return (
      <SafeAreaView style={styles.screenBg}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Pedido confirmado!</Text>
            <Text style={styles.productDesc}>
              Obrigado por escolher a Ouro Doce.
            </Text>

            <Text style={styles.successNumber}>
              #{ultimoPedido.numero}
            </Text>

            <View style={styles.divider} />

            {ultimoPedido.itens.map((item, index) => (
              <Text key={index} style={styles.receiptItem}>
                {item.quantidade}x {item.nome}
              </Text>
            ))}

            <View style={styles.divider} />

            <Text style={styles.summaryTotal}>
              Total: {dinheiro(ultimoPedido.total)}
            </Text>

            <View style={styles.espStatusBox}>
              <Text style={styles.espStatusText}>
                {ultimoPedido.enviadoAoHardware
                  ? "Pedido enviado ao ESP32."
                  : "Pedido registrado no aplicativo. ESP32 não respondeu."}
              </Text>
            </View>

            {userMode === "logged" && (
              <Text style={styles.pointsEarnedText}>
                Você ganhou {ultimoPedido.pontosGanhos} pontos!
              </Text>
            )}
          </View>

          <Pressable
            style={styles.btnPrimary}
            onPress={() => setScreen("home")}
          >
            <Text style={styles.btnPrimaryText}>Voltar ao início</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PERFIL
  if (screen === "profile") {
    return (
      <SafeAreaView style={styles.screenBg}>
        <Header titulo="Meu perfil" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {userMode === "logged" && currentUser ? (
            <>
              <View style={styles.profileCard}>
                <Text style={styles.sectionTitle}>
                  {currentUser.nome}
                </Text>
                <Text style={styles.productDesc}>
                  {currentUser.email}
                </Text>
              </View>

              <View style={styles.pointsCard}>
                <Text style={styles.pointsCardLabel}>
                  PROGRAMA DE FIDELIDADE
                </Text>
                <Text style={styles.pointsCardValue}>{points}</Text>
                <Text style={styles.pointsCardSub}>
                  Pontos acumulados
                </Text>
              </View>

              <Pressable
                style={styles.logoutBtn}
                onPress={() => setShowLogoutModal(true)}
              >
                <Text style={styles.logoutBtnText}>Sair da conta</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Você está navegando como visitante.
              </Text>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => setScreen("login")}
              >
                <Text style={styles.btnPrimaryText}>
                  Entrar ou cadastrar
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>

        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.sectionTitle}>Deseja sair?</Text>
              <Text style={styles.productDesc}>
                Você precisará entrar novamente para acessar seu perfil.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancel}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={styles.modalConfirm}
                  onPress={handleLogout}
                >
                  <Text style={{ color: "#FFF", fontWeight: "800" }}>
                    Sair
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenBg}>
      <Text>Carregando...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: BG },
  welcomeImage: { flex: 1, justifyContent: "flex-end" },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,10,0,0.65)",
  },
  welcomePanel: {
    backgroundColor: BROWN,
    padding: 28,
    paddingBottom: 42,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  brandTag: {
    color: AMBER,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    marginBottom: 8,
  },
  welcomeSub: {
    color: "#D6C8BB",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  btnPrimary: {
    backgroundColor: ORANGE,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#806C56",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnOutlineText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  guestLink: {
    color: "#D6C8BB",
    textAlign: "center",
    fontSize: 14,
    marginTop: 18,
    padding: 8,
  },
  appHeader: {
    backgroundColor: BROWN,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: { color: AMBER, fontWeight: "700", fontSize: 14 },
  headerTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 18 },
  homeHeader: {
    backgroundColor: BROWN,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandSerif: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  brandGoldSub: { color: AMBER, fontSize: 12, marginTop: 3 },
  iconBox: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  iconLabel: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  authContent: { padding: 24 },
  authWelcome: {
    color: ORANGE,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },
  fieldGroup: { marginBottom: 15 },
  fieldLabel: {
    color: BROWN,
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#E2D1BF",
    borderRadius: 10,
    padding: 13,
    color: BROWN,
  },
  errorText: {
    color: "#C13030",
    fontWeight: "700",
    marginVertical: 8,
  },
  switchAuthText: {
    color: BROWN,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 20,
  },
  scrollContent: { padding: 18, paddingBottom: 100 },
  sectionTitle: {
    color: BROWN,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 10,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: CARD_BG,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EADCCB",
    marginBottom: 8,
  },
  categoryTitle: { color: BROWN, fontWeight: "800", fontSize: 15 },
  categoryAction: {
    color: ORANGE,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "700",
  },
  monteBanner: {
    backgroundColor: BROWN,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  monteTag: {
    color: AMBER,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  monteTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  monteDesc: { color: "#D6C8BB", fontSize: 12, marginTop: 4 },
  monteArrow: {
    color: AMBER,
    fontSize: 30,
    fontWeight: "900",
    marginLeft: 10,
  },
  productCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EADCCB",
  },
  productImg: {
    width: "100%",
    height: 155,
    backgroundColor: "#E8D6C3",
  },
  productInfo: { padding: 15 },
  productCategory: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  productName: {
    color: BROWN,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },
  productDesc: {
    color: "#715E4F",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  productPrice: { color: BROWN, fontSize: 17, fontWeight: "900" },
  addSmallBtnText: {
    color: ORANGE,
    fontWeight: "800",
    fontSize: 13,
  },
  searchContainer: { paddingHorizontal: 18, paddingTop: 14 },
  searchInput: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2D1BF",
    color: BROWN,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#EFE3D4",
  },
  tabPillActive: { backgroundColor: BROWN },
  tabText: { color: BROWN, fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: "#FFFFFF" },
  optionRow: {
    backgroundColor: CARD_BG,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EADCCB",
  },
  optionRowActive: {
    borderColor: ORANGE,
    backgroundColor: "#FFF7F0",
  },
  optionText: { color: BROWN, fontWeight: "700", fontSize: 14 },
  radio: { color: ORANGE, fontSize: 16, fontWeight: "900" },
  cartItem: {
    backgroundColor: CARD_BG,
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  extrasText: { color: ORANGE, fontSize: 12, marginTop: 4 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    backgroundColor: "#F1E2CE",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { color: BROWN, fontWeight: "900", fontSize: 18 },
  qtyValue: { color: BROWN, fontWeight: "800", fontSize: 15 },
  summaryBox: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { color: BROWN, fontSize: 16, fontWeight: "700" },
  summaryTotal: { color: BROWN, fontSize: 20, fontWeight: "900" },
  pointsBanner: {
    backgroundColor: "#FFF6E5",
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: AMBER,
  },
  pointsBannerTitle: { color: BROWN, fontWeight: "900", fontSize: 13 },
  pointsBannerText: {
    color: "#715E4F",
    fontSize: 12,
    marginTop: 3,
  },
  shareBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BROWN,
    alignItems: "center",
  },
  shareBtnText: { color: BROWN, fontWeight: "700", fontSize: 12 },
  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyText: {
    color: BROWN,
    textAlign: "center",
    marginTop: 30,
    fontWeight: "700",
  },
  successCard: {
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
  },
  successTitle: {
    color: ORANGE,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  successNumber: {
    color: BROWN,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 14,
  },
  espStatusBox: {
    backgroundColor: "#F1E2CE",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  espStatusText: { color: BROWN, fontWeight: "800", fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: "#EADCCB",
    marginVertical: 14,
  },
  receiptItem: { color: BROWN, fontSize: 14, marginBottom: 7 },
  pointsEarnedText: {
    color: ORANGE,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: CARD_BG,
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },
  pointsCard: {
    backgroundColor: BROWN,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  pointsCardLabel: {
    color: AMBER,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  pointsCardValue: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    marginVertical: 4,
  },
  pointsCardSub: { color: "#D6C8BB", fontSize: 12 },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalOutside: { flex: 1 },
  modalBox: {
    backgroundColor: CARD_BG,
    margin: 20,
    padding: 22,
    borderRadius: 16,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  modalCancel: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#EFE3D4",
    alignItems: "center",
  },
  modalConfirm: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  drawerBox: {
    backgroundColor: CARD_BG,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  drawerImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: {
    color: BROWN,
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },
  closeDrawer: { color: ORANGE, fontWeight: "800", padding: 8 },
  drawerSubtitle: {
    color: BROWN,
    fontWeight: "800",
    fontSize: 14,
    marginTop: 16,
    marginBottom: 10,
  },
  drawerTotal: {
    color: BROWN,
    fontWeight: "900",
    fontSize: 18,
    marginTop: 12,
  },
  extraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EADCCB",
    marginBottom: 8,
  },
  extraRowActive: {
    backgroundColor: "#FFF7F0",
    borderColor: ORANGE,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#EADCCB",
    paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: "center" },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 5,
  },
  navDotActive: { backgroundColor: ORANGE },
  navText: { color: "#806E5D", fontSize: 11, fontWeight: "700" },
  navTextActive: { color: BROWN, fontWeight: "900" },
  toast: {
    backgroundColor: ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  toastText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  builderImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
  },
});
