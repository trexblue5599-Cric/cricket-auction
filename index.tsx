import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuction } from "@/context/AuctionContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players, teams, auctionState, startAuction, resetAuction, shufflePlayers } = useAuction();

  const soldPlayers = players.filter((p) => p.teamId);
  const unsoldPlayers = players.filter((p) => !p.teamId);
  const totalValue = soldPlayers.reduce((s, p) => s + (p.soldPrice || 0), 0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome to</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Cricket Auction</Text>
        </View>
        <View style={[styles.iconBall, { backgroundColor: colors.primary }]}>
          <Feather name="award" size={24} color="#fff" />
        </View>
      </View>

      {/* Glass Hero Banner */}
      <LinearGradient
        colors={["rgba(99,102,241,0.15)", "rgba(139,92,246,0.10)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.glassHero, { borderColor: "rgba(129,140,248,0.2)" }]}
      >
        <View style={styles.heroGlow} />
        <Text style={styles.heroTag}>🏏 IPL-STYLE AUCTION</Text>
        <Text style={styles.heroTitle}>
          {auctionState.phase === "auction"
            ? "⚡ Auction in Progress!"
            : auctionState.phase === "completed"
            ? "✅ Auction Completed"
            : "🚀 Ready to Bid?"}
        </Text>
        <Text style={styles.heroSub}>
          {players.length} players · {teams.length} teams
        </Text>

        {auctionState.phase === "setup" && (
          <View style={styles.heroBtnRow}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => {
                startAuction();
                router.push("/auction");
              }}
            >
              <LinearGradient
                colors={["#818cf8", "#a78bfa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heroBtnGradient}
              >
                <Text style={styles.heroBtnText}>Start Auction</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroBtnGhost]}
              onPress={() => {
                shufflePlayers();
                Alert.alert("Shuffled!", "Player auction order has been randomized.");
              }}
            >
              <Feather name="shuffle" size={16} color="#a78bfa" />
              <Text style={[styles.heroBtnGhostText]}>Shuffle</Text>
            </TouchableOpacity>
          </View>
        )}

        {auctionState.phase === "auction" && (
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push("/auction")}
          >
            <LinearGradient
              colors={["#818cf8", "#a78bfa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroBtnGradient}
            >
              <Text style={styles.heroBtnText}>Resume Auction</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {auctionState.phase === "completed" && (
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => {
              Alert.alert("Reset Auction", "This will reset all bids. Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: resetAuction },
              ]);
            }}
          >
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroBtnGradient}
            >
              <Text style={styles.heroBtnText}>Reset Auction</Text>
              <Feather name="refresh-cw" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Glass Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.glassStat, { borderColor: "rgba(129,140,248,0.3)" }]}>
          <Text style={[styles.statNum, { color: "#818cf8" }]}>{players.length}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={[styles.glassStat, { borderColor: "rgba(52,211,153,0.3)" }]}>
          <Text style={[styles.statNum, { color: "#34d399" }]}>{soldPlayers.length}</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
        <View style={[styles.glassStat, { borderColor: "rgba(244,114,182,0.3)" }]}>
          <Text style={[styles.statNum, { color: "#f472b6" }]}>{unsoldPlayers.length}</Text>
          <Text style={styles.statLabel}>Unsold</Text>
        </View>
        <View style={[styles.glassStat, { borderColor: "rgba(251,191,36,0.3)" }]}>
          <Text style={[styles.statNum, { color: "#fbbf24" }]}>{teams.length}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
      </View>

      {/* Total Value Glass Card */}
      {totalValue > 0 && (
        <LinearGradient
          colors={["rgba(52,211,153,0.10)", "rgba(16,185,129,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.valueGlass, { borderColor: "rgba(52,211,153,0.2)" }]}
        >
          <Feather name="trending-up" size={20} color="#34d399" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.valueLabel, { color: "#34d399" }]}>Total Value Auctioned</Text>
            <Text style={[styles.valueNum, { color: "#34d399" }]}>₹{totalValue} Lakhs</Text>
          </View>
        </LinearGradient>
      )}

      {/* Quick Actions - Neon Glass */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.glassAction, { borderColor: "rgba(129,140,248,0.2)" }]}
          onPress={() => router.push("/players")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(129,140,248,0.15)" }]}>
            <Feather name="users" size={24} color="#818cf8" />
          </View>
          <Text style={[styles.actionLabel, { color: "#818cf8" }]}>Players</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.glassAction, { borderColor: "rgba(52,211,153,0.2)" }]}
          onPress={() => router.push("/teams")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(52,211,153,0.15)" }]}>
            <Feather name="shield" size={24} color="#34d399" />
          </View>
          <Text style={[styles.actionLabel, { color: "#34d399" }]}>Teams</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.glassAction, { borderColor: "rgba(251,191,36,0.2)" }]}
          onPress={() => router.push("/players/create")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(251,191,36,0.15)" }]}>
            <Feather name="user-plus" size={24} color="#fbbf24" />
          </View>
          <Text style={[styles.actionLabel, { color: "#fbbf24" }]}>Add Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.glassAction, { borderColor: "rgba(196,181,253,0.2)" }]}
          onPress={() => router.push("/results")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(196,181,253,0.15)" }]}>
            <Feather name="bar-chart-2" size={24} color="#c4b5fd" />
          </View>
          <Text style={[styles.actionLabel, { color: "#c4b5fd" }]}>Results</Text>
        </TouchableOpacity>

        {auctionState.phase === "setup" && (
          <TouchableOpacity
            style={[styles.glassAction, styles.retainAction, { borderColor: "rgba(244,114,182,0.2)" }]}
            onPress={() => router.push("/retain")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "rgba(244,114,182,0.15)" }]}>
              <Feather name="star" size={24} color="#f472b6" />
            </View>
            <Text style={[styles.actionLabel, { color: "#f472b6" }]}>Retain</Text>
            <Text style={styles.actionSub}>Max 6</Text>
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
    fontWeight: "500",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  iconBall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#818cf8",
    shadowRadius: 20,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  glassHero: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#818cf8",
    shadowRadius: 30,
    shadowOpacity: 0.1,
    elevation: 5,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(129,140,248,0.08)",
  },
  heroTag: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginBottom: 20,
  },
  heroBtnRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  heroBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  heroBtnGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  heroBtnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroBtnGhostText: {
    color: "#a78bfa",
    fontSize: 15,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  glassStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
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
  valueGlass: {
    marginHorizontal: 16,
    borderRadius: 16,
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
  glassAction: {
    width: (width - 44) / 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  actionSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    marginTop: -4,
    fontWeight: "600",
  },
  retainAction: {
    width: "100%",
  },
});
