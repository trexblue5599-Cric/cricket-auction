import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuction } from "@/context/AuctionContext";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players, teams, auctionState, startAuction, resetAuction, shufflePlayers } = useAuction();

  const soldPlayers = players.filter((p) => p.teamId);
  const unsoldPlayers = players.filter((p) => !p.teamId);
  const totalValue = soldPlayers.reduce((s, p) => s + (p.soldPrice || 0), 0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: bottomPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome to</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Cricket Auction</Text>
        </View>
        <View style={[styles.iconBall, { backgroundColor: colors.primary }]}>
          <Feather name="award" size={24} color="#fff" />
        </View>
      </View>

      {/* Hero Banner */}
      <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTag}>IPL-STYLE AUCTION</Text>
          <Text style={styles.heroTitle}>
            {auctionState.phase === "auction"
              ? "Auction in Progress!"
              : auctionState.phase === "completed"
              ? "Auction Completed"
              : "Ready to Bid?"}
          </Text>
          <Text style={styles.heroSub}>
            {players.length} players · {teams.length} teams
          </Text>
          {auctionState.phase === "setup" && (
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => {
                  startAuction();
                  router.push("/auction");
                }}
              >
                <Text style={styles.heroBtnText}>Start Auction</Text>
                <Feather name="arrow-right" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroBtn, { backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" }]}
                onPress={() => {
                  shufflePlayers();
                  Alert.alert("Shuffled!", "Player auction order has been randomized.");
                }}
              >
                <Feather name="shuffle" size={16} color="#fff" />
                <Text style={[styles.heroBtnText, { color: "#fff" }]}>Shuffle</Text>
              </TouchableOpacity>
            </View>
          )}
          {auctionState.phase === "auction" && (
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push("/auction")}
            >
              <Text style={styles.heroBtnText}>Resume Auction</Text>
              <Feather name="arrow-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          {auctionState.phase === "completed" && (
            <TouchableOpacity style={styles.heroBtn} onPress={resetAuction}>
              <Text style={styles.heroBtnText}>Reset Auction</Text>
              <Feather name="refresh-cw" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{players.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Players</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: "#16a34a" }]}>{soldPlayers.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Sold</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: "#dc2626" }]}>{unsoldPlayers.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Unsold</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: "#d97706" }]}>{teams.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Teams</Text>
        </View>
      </View>

      {/* Total Value */}
      {totalValue > 0 && (
        <View style={[styles.valueCard, { backgroundColor: "#16a34a" + "15", borderColor: "#16a34a" + "40" }]}>
          <Feather name="trending-up" size={20} color="#16a34a" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.valueLabel, { color: "#16a34a" }]}>Total Value Auctioned</Text>
            <Text style={[styles.valueNum, { color: "#16a34a" }]}>₹{totalValue} Lakhs</Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
          onPress={() => router.push("/players")}
        >
          <Feather name="users" size={28} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary }]}>Players</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#16a34a15", borderColor: "#16a34a30" }]}
          onPress={() => router.push("/teams")}
        >
          <Feather name="shield" size={28} color="#16a34a" />
          <Text style={[styles.actionLabel, { color: "#16a34a" }]}>Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#d9770615", borderColor: "#d9770630" }]}
          onPress={() => router.push("/players/create")}
        >
          <Feather name="user-plus" size={28} color="#d97706" />
          <Text style={[styles.actionLabel, { color: "#d97706" }]}>Add Player</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#7c3aed15", borderColor: "#7c3aed30" }]}
          onPress={() => router.push("/results")}
        >
          <Feather name="bar-chart-2" size={28} color="#7c3aed" />
          <Text style={[styles.actionLabel, { color: "#7c3aed" }]}>Results</Text>
        </TouchableOpacity>
        {auctionState.phase === "setup" && (
          <TouchableOpacity
            style={[styles.actionCard, styles.retainCard, { backgroundColor: "#ec489915", borderColor: "#ec489930" }]}
            onPress={() => router.push("/retain")}
          >
            <Feather name="star" size={28} color="#ec4899" />
            <Text style={[styles.actionLabel, { color: "#ec4899" }]}>Retain Players</Text>
            <Text style={[styles.actionSub, { color: "#ec489999" }]}>Max 6 per team</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  iconBall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroContent: {},
  heroTag: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  heroSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  heroBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  valueCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  valueNum: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  actionSub: {
    fontSize: 11,
    marginTop: -4,
  },
  retainCard: {
    width: "100%",
  },
});
