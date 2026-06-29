import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Menggunakan Pokemon API dengan limit awal untuk pagination
const BASE_URL = 'https://pokeapi.co/api/v2/pokemon?limit=20&offset=';
const STORAGE_KEY = '@poke_favorites';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fitur Level 2 & 3
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- ANIMATION REFS ---
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- EFFECT ---
  useEffect(() => {
    loadFavorites();
    fetchPokemon(0, true);
  }, []);

  // --- API FETCHING (LEVEL 1: try-catch-finally & Async/Await) ---
  const fetchPokemon = async (currentOffset, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`${BASE_URL}${currentOffset}`);
      if (!response.ok) throw new Error('Gagal mengambil data dari server.');
      const data = await response.json();

      if (data.results.length === 0) {
        setHasMore(false);
        return;
      }

      // Fetch detail untuk gambar & id asli
      const detailPromises = data.results.map(async (item) => {
        const res = await fetch(item.url);
        return res.json();
      });

      const detailedResults = await Promise.all(detailPromises);

      const formattedData = detailedResults.map((poke) => ({
        id: poke.id,
        name: poke.name.charAt(0).toUpperCase() + poke.name.slice(1),
        image: poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default,
        height: poke.height,
        weight: poke.weight,
        type: poke.types.map(t => t.type.name).join(', '),
        abilities: poke.abilities.map(a => a.ability.name).join(', ')
      }));

      if (isInitial) {
        setPokemonList(formattedData);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        setPokemonList(prev => [...prev, ...formattedData]);
      }

      setOffset(currentOffset + 20);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // --- LEVEL 2: Pull-to-Refresh ---
  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    setOffset(0);
    fetchPokemon(0, true);
  };

  // --- LEVEL 3: Pagination (Infinite Scroll) ---
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && searchQuery === '') {
      fetchPokemon(offset, false);
    }
  };

  // --- LEVEL 3: AsyncStorage (Local Favorites) ---
  const loadFavorites = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      let updatedFavs = [...favorites];
      if (updatedFavs.includes(id)) {
        updatedFavs = updatedFavs.filter(favId => favId !== id);
      } else {
        updatedFavs.push(id);
      }
      setFavorites(updatedFavs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavs));
    } catch (e) {
      console.error(e);
    }
  };

  // --- LEVEL 2: Client-side Search & LEVEL 3: Sorting ---
  const getProcessedData = () => {
    let filtered = pokemonList.filter(poke =>
      poke.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poke.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  };

  const openDetail = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalVisible(true);
  };

  // LEVEL 1: Kondisi UI - Loading State
  if (loading && offset === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EF5350" />
        <Text style={styles.loadingText}>Menghubungi Professor Oak... 🪵</Text>
      </View>
    );
  }

  // LEVEL 1: Kondisi UI - Error State & Retry Button
  if (error && pokemonList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 50 }}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPokemon(0, true)}>
          <Text style={styles.retryButtonText}>🔄 Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER & SEARCH BAR */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PokeExplorer 🚀</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Pokemon..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.sortButton} 
            onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <Text style={{ fontSize: 18 }}>Import {sortOrder === 'asc' ? '🔼' : '🔽'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN FLATLIST */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={getProcessedData()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isFav = favorites.includes(item.id);
            return (
              <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardId}>#{item.id.toString().padStart(3, '0')}</Text>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardType}>Type: {item.type}</Text>
                </View>
                <TouchableOpacity style={styles.favButton} onPress={() => toggleFavorite(item.id)}>
                  <Text style={{ fontSize: 22 }}>{isFav ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#EF5350"]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            loadingMore ? <ActivityIndicator size="small" color="#EF5350" style={{ marginVertical: 16 }} /> : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 50 }}>📦</Text>
              <Text style={styles.emptyText}>Pokemon tidak ditemukan</Text>
              <Text style={styles.emptySubtext}>Coba ketik kata kunci lain.</Text>
            </View>
          )}
        />
      </Animated.View>

      {/* LEVEL 2: Layar Detail (Modal) */}
      {selectedPokemon && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>❌</Text>
              </TouchableOpacity>
              
              <Image source={{ uri: selectedPokemon.image }} style={styles.detailImage} />
              <Text style={styles.detailTitle}>{selectedPokemon.name}</Text>
              <Text style={styles.detailTag}>Type: {selectedPokemon.type}</Text>

              <View style={styles.divider} />

              <View style={styles.detailStatsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Tinggi</Text>
                  <Text style={styles.statValue}>{selectedPokemon.height / 10} m</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Berat</Text>
                  <Text style={styles.statValue}>{selectedPokemon.weight / 10} kg</Text>
                </View>
              </View>

              <View style={styles.abilityContainer}>
                <Text style={styles.abilityTitle}>Kemampuan (Abilities):</Text>
                <Text style={styles.abilityValue}>{selectedPokemon.abilities}</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// --- STYLING ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#7F8C8D', fontWeight: '500' },
  errorText: { marginTop: 12, fontSize: 16, color: '#34495E', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#EF5350', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  retryButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F2F6', borderRadius: 10, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: '#2C3E50' },
  sortButton: { padding: 8, marginLeft: 8 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardImage: { width: 80, height: 80, resizeMode: 'contain' },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardId: { fontSize: 12, color: '#95A5A6', fontWeight: '600' },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginVertical: 2 },
  cardType: { fontSize: 14, color: '#7F8C8D' },
  favButton: { padding: 8 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 60, padding: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#7F8C8D', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#95A5A6', marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', minHeight: '50%' },
  closeModalButton: { alignSelf: 'flex-end', padding: 4 },
  detailImage: { width: 150, height: 150, resizeMode: 'contain', marginTop: -20 },
  detailTitle: { fontSize: 26, fontWeight: 'bold', color: '#2C3E50', marginTop: 12 },
  detailTag: { fontSize: 14, color: '#FFF', backgroundColor: '#EF5350', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8, overflow: 'hidden', fontWeight: '600' },
  divider: { width: '100%', height: 1, backgroundColor: '#ECF0F1', marginVertical: 20 },
  detailStatsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 20 },
  statBox: { alignItems: 'center', backgroundColor: '#F8F9FA', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12, flex: 1, marginHorizontal: 8 },
  statLabel: { fontSize: 12, color: '#95A5A6', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  abilityContainer: { width: '100%', backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12 },
  abilityTitle: { fontSize: 14, fontWeight: 'bold', color: '#34495E', marginBottom: 4 },
  abilityValue: { fontSize: 14, color: '#7F8C8D', lineHeight: 20 }
});