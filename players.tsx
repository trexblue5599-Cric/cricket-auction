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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Players</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/players/create")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search players..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={ROLES}
        keyExtractor={(r) => r}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.roleChip,
              {
                backgroundColor: selectedRole === item ? colors.primary : colors.card,
                borderColor: selectedRole === item ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedRole(item)}
          >
            <Text
              style={[
                styles.roleChipText,
                { color: selectedRole === item ? "#fff" : colors.foreground },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.roleList}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  roleList: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: { paddingTop: 4 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
