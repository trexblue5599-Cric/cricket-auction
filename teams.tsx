import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuction } from "@/context/AuctionContext";
import { TeamCard } from "@/components/TeamCard";

export default function TeamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { teams, players } = useAuction();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Teams</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: "#16a34a" }]}
          onPress={() => router.push("/teams/create")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => {
          const count = players.filter((p) => p.teamId === item.id).length;
          return (
            <TeamCard
              team={item}
              playerCount={count}
              onPress={() => router.push(`/teams/${item.id}`)}
              onEdit={() => router.push(`/teams/${item.id}/edit`)}
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
            <Feather name="shield-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No teams yet</Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: "#16a34a" }]}
              onPress={() => router.push("/teams/create")}
            >
              <Text style={styles.emptyBtnText}>Add Team</Text>
            </TouchableOpacity>
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
  list: { paddingTop: 8 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
