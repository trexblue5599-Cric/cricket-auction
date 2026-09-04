import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuction } from "@/context/AuctionContext";
import { PlayerCard } from "@/components/PlayerCard";
import type { PlayerRole } from "@/context/AuctionContext";

const ROLES: (PlayerRole | "All")[] = ["All", "Batsman", "Bowler", "All-Rounder", "Wicket Keeper", "Spinner"];

export default function PlayersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players, teams } = useAuction();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<PlayerRole | "All">("All");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.country.toLowerCase().includes(search.toLowerCase());
      const matchesRole = selectedRole === "All" || p.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [players, search, selectedRole]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const soldCount = players.filter((p) => p.teamId).length;
  const unsoldCount = players.filter((p) => !p.teamId).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glass Header */}
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.glassHeader, { paddingTop: topPadding + 12, borderBottomColor: "rgba(255,255,255,0.06)" }]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>🏏 Players</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/players/create")}
        >
          <LinearGradient
            colors={["#818cf8", "#a78bfa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addBtnGradient}
          >
            <Feather name="plus" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.glassStat, { borderColor: "rgba(129,140,248,0.2)" }]}>
          <Text style={[styles.statNum, { color: "#818cf8" }]}>{players.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.glassStat, { borderColor: "rgba(52,211,153,0.2)" }]}>
          <Text style={[styles.statNum, { color: "#34d399" }]}>{soldCount}</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
        <View style={[styles.glassStat, { borderColor: "rgba(244,114,182,0.2)" }]}>
          <Text style={[styles.statNum, { color: "#f472b6" }]}>{unsoldCount}</Text>
          <Text style={styles.statLabel}>Unsold</Text>
        </View>
      </View>

      {/* Glass Search Bar */}
      <View style={[styles.glassSearch, { borderColor: "rgba(255,255,255,0.06)" }]}>
        <Feather name="search" size={20} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search players..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filters */}
      <FlatList
        horizontal
        data={ROLES}
        keyExtractor={(r) => r}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.glassFilter,
              {
                borderColor: selectedRole === item ? "#818cf8" : "rgba(255,255,255,0.06)",
                backgroundColor: selectedRole === item ? "rgba(129,140,248,0.15)" : "rgba(255,255,255,0.04)",
              },
            ]}
            onPress={() => setSelectedRole(item)}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedRole === item ? "#818cf8" : colors.mutedForeground },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {filtered.length} player{filtered.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => {
          const team = item.teamId ? teams.find((t) => t.id === item.teamId) : undefined;
          return (
            <PlayerCard
              player={item}
              teamName={team?.name}
              teamColor={team?.color}
              onPress={() => router.push(`/players/${item.id}`)}
              compact
            />
          );
        }}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="user-x" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No players found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glassHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  addBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addBtnGradient: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  glassStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
    fontWeight: "600",
  },
  glassSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  glassFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: { paddingTop: 4, paddingHorizontal: 16 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
