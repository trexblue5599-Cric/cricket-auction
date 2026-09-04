import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuction } from "@/context/AuctionContext";

const MIN_SQUAD = 16;

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players, teams } = useAuction();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const soldPlayers = useMemo(
    () => players.filter((p) => p.teamId && p.soldPrice).sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)),
    [players]
  );
  const totalValue = soldPlayers.reduce((s, p) => s + (p.soldPrice || 0), 0);
  const topBuyerTeam = useMemo(() => {
    let max = 0, topTeam = null as any;
    for (const t of teams) {
      const spent = t.budget - t.remainingBudget;
      if (spent > max) { max = spent; topTeam = t; }
    }
    return topTeam;
  }, [teams]);

  const handleShare = async () => {
    let text = "🏏 Cricket Auction Results\n";
    text += "═══════════════════\n\n";
    text += `✅ Players Sold: ${soldPlayers.length}\n`;
    text += `💰 Total Value: ₹${totalValue}L\n`;
    text += `❌ Unsold: ${players.filter((p) => !p.teamId).length}\n\n`;
    text += "📊 Team Summary:\n";
    teams.forEach((team) => {
      const tp = players.filter((p) => p.teamId === team.id);
      const spent = team.budget - team.remainingBudget;
      const warn = tp.length < MIN_SQUAD ? " ⚠️" : "";
      text += `  ${team.shortName} ${team.name}: ${tp.length} players · ₹${spent}L${warn}\n`;
    });
    text += "\n🏆 Top 5 Players:\n";
    soldPlayers.slice(0, 5).forEach((p, i) => {
      const team = teams.find((t) => t.id === p.teamId);
      text += `  ${i + 1}. ${p.name} → ${team?.shortName || "?"} ₹${p.soldPrice}L\n`;
    });
    await Share.share({ message: text });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glass Header */}
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.glassHeader, { paddingTop: topPadding + 12, borderBottomColor: "rgba(255,255,255,0.06)" }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>🏆 Results</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerIcon}>
          <Feather name="share-2" size={22} color="#818cf8" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={soldPlayers}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View>
            {/* Summary Cards - Glass */}
            <View style={styles.summaryRow}>
              <View style={[styles.glassSummary, { borderColor: "rgba(129,140,248,0.2)" }]}>
                <Text style={[styles.summaryVal, { color: "#818cf8" }]}>{soldPlayers.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Sold</Text>
              </View>
              <View style={[styles.glassSummary, { borderColor: "rgba(52,211,153,0.2)" }]}>
                <Text style={[styles.summaryVal, { color: "#34d399" }]}>₹{totalValue}L</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total</Text>
              </View>
              <View style={[styles.glassSummary, { borderColor: "rgba(244,114,182,0.2)" }]}>
                <Text style={[styles.summaryVal, { color: "#f472b6" }]}>
                  {players.filter((p) => !p.teamId).length}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Unsold</Text>
              </View>
            </View>

            {/* Top Spender - Glass with Neon Glow */}
            {topBuyerTeam && (
              <LinearGradient
                colors={[topBuyerTeam.color + "20", topBuyerTeam.color + "10"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.glassTopCard, { borderColor: topBuyerTeam.color + "40" }]}
              >
                <View style={[styles.trophyIcon, { backgroundColor: topBuyerTeam.color + "30" }]}>
                  <Feather name="trophy" size={20} color={topBuyerTeam.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.topCardLabel, { color: colors.mutedForeground }]}>Biggest Spender</Text>
                  <Text style={[styles.topCardTeam, { color: topBuyerTeam.color }]}>{topBuyerTeam.name}</Text>
                </View>
                <Text style={[styles.topCardAmt, { color: topBuyerTeam.color }]}>
                  ₹{topBuyerTeam.budget - topBuyerTeam.remainingBudget}L
                </Text>
              </LinearGradient>
            )}

            {/* Team Summary */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📊 Team Summary</Text>
            {teams.map((team) => {
              const tp = players.filter((p) => p.teamId === team.id);
              const spent = team.budget - team.remainingBudget;
              const understrength = tp.length < MIN_SQUAD;
              return (
                <LinearGradient
                  key={team.id}
                  colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.glassTeamRow,
                    {
                      borderColor: understrength ? "#fbbf2440" : "rgba(255,255,255,0.06)",
                      borderWidth: understrength ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={[styles.teamDot, { backgroundColor: team.color }]} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.teamRowName, { color: colors.foreground }]}>{team.name}</Text>
                      {understrength && (
                        <View style={styles.glassWarnBadge}>
                          <Text style={styles.warnBadgeText}>⚠️ {tp.length}/{MIN_SQUAD}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.teamRowPlayers, { color: colors.mutedForeground }]}>{tp.length} players</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.teamRowSpent, { color: colors.foreground }]}>₹{spent}L</Text>
                    <Text style={[styles.teamRowRemaining, { color: "#34d399" }]}>₹{team.remainingBudget}L left</Text>
                  </View>
                </LinearGradient>
              );
            })}

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🏅 Top Sold Players</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const team = teams.find((t) => t.id === item.teamId);
          return (
            <LinearGradient
              key={item.id}
              colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.glassPlayerRow, { borderColor: "rgba(255,255,255,0.06)" }]}
            >
              <Text style={[styles.rank, { color: colors.mutedForeground }]}>#{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.playerName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.playerMeta, { color: colors.mutedForeground }]}>
                  {item.country} · {item.role}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.soldPrice, { color: "#34d399", textShadowColor: "#34d399", textShadowRadius: 10 }]}>
                  ₹{item.soldPrice}L
                </Text>
                {team && (
                  <View style={[styles.glassTeamBadge, { backgroundColor: team.color + "30", borderColor: team.color + "40" }]}>
                    <Text style={[styles.teamBadgeText, { color: team.color }]}>{team.shortName}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          );
        }}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 80 : 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bar-chart-2" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results yet. Start the auction!</Text>
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
  headerIcon: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  summaryRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginTop: 16, marginBottom: 8 },
  glassSummary: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  summaryVal: { fontSize: 22, fontWeight: "900" },
  summaryLabel: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  glassTopCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  trophyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topCardLabel: { fontSize: 12, fontWeight: "500" },
  topCardTeam: { fontSize: 16, fontWeight: "700" },
  topCardAmt: { fontSize: 20, fontWeight: "800" },
  sectionTitle: { fontSize: 18, fontWeight: "700", paddingHorizontal: 20, paddingBottom: 10, marginTop: 4 },
  glassTeamRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  teamDot: { width: 12, height: 12, borderRadius: 6 },
  teamRowName: { fontSize: 14, fontWeight: "600" },
  teamRowPlayers: { fontSize: 12, marginTop: 2 },
  teamRowSpent: { fontSize: 15, fontWeight: "700" },
  teamRowRemaining: { fontSize: 12, marginTop: 2 },
  glassWarnBadge: {
    backgroundColor: "#fbbf2420",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#fbbf2440",
  },
  warnBadgeText: { fontSize: 11, color: "#fbbf24", fontWeight: "600" },
  glassPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  rank: { fontSize: 16, fontWeight: "700", width: 30 },
  playerName: { fontSize: 14, fontWeight: "600" },
  playerMeta: { fontSize: 12, marginTop: 2 },
  soldPrice: { fontSize: 16, fontWeight: "700" },
  glassTeamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
  },
  teamBadgeText: { fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, textAlign: "center" },
});
