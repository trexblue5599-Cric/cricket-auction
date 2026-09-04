import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useEffect } from "react";
import {
  Alert,
  Animated,
  Image,
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

const ROLE_COLORS: Record<string, string> = {
  Batsman: "#818cf8",
  Bowler: "#f472b6",
  "All-Rounder": "#34d399",
  "Wicket Keeper": "#c4b5fd",
  Spinner: "#fbbf24",
};

const MIN_SQUAD = 16;

export default function AuctionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players, teams, auctionState, placeBid, sellPlayer, passPlayer, resetAuction, reAuctionUnsold } = useAuction();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const unsoldPlayers = useMemo(() => players.filter((p) => !p.teamId), [players]);
  const currentPlayer = useMemo(
    () => unsoldPlayers[auctionState.currentPlayerIndex] ?? null,
    [unsoldPlayers, auctionState.currentPlayerIndex]
  );
  const currentBidTeam = useMemo(
    () => (auctionState.currentBidTeamId ? teams.find((t) => t.id === auctionState.currentBidTeamId) : null),
    [teams, auctionState.currentBidTeamId]
  );

  const roleColor = currentPlayer ? ROLE_COLORS[currentPlayer.role] || colors.primary : colors.primary;

  // Animations
  const bidScaleAnim = useRef(new Animated.Value(1)).current;
  const soldFlashAnim = useRef(new Animated.Value(0)).current;
  const cardGlowAnim = useRef(new Animated.Value(0)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bidScaleAnim, { toValue: 1.25, duration: 130, useNativeDriver: true }),
      Animated.timing(bidScaleAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [auctionState.currentBid]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cardGlowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(cardGlowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [currentPlayer?.id]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleSell = () => {
    sellPlayer();
    Animated.sequence([
      Animated.timing(soldFlashAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(soldFlashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const cardGlowOpacity = cardGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  if (auctionState.phase === "setup") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.centerMsg, { paddingTop: topPadding }]}>
          <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
          <Text style={[styles.msgTitle, { color: colors.foreground }]}>Auction not started</Text>
          <Text style={[styles.msgSub, { color: colors.mutedForeground }]}>Go to Home to start the auction</Text>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.actionBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (auctionState.phase === "completed") {
    const truly_unsold = players.filter((p) => !p.teamId);
    const understrength = teams.filter((t) => players.filter((p) => p.teamId === t.id).length < MIN_SQUAD);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.centerMsg, { paddingTop: topPadding }]}>
          <Feather name="check-circle" size={64} color="#34d399" />
          <Text style={[styles.msgTitle, { color: colors.foreground }]}>Auction Complete!</Text>
          <Text style={[styles.msgSub, { color: colors.mutedForeground }]}>
            All players have been auctioned. Check results!
          </Text>

          {understrength.length > 0 && (
            <View style={[styles.warnBox, { backgroundColor: "#fbbf2415", borderColor: "#fbbf2440" }]}>
              <Feather name="alert-triangle" size={16} color="#fbbf24" />
              <Text style={[styles.warnText, { color: "#fbbf24" }]}>
                {understrength.map((t) => t.name).join(", ")} have fewer than {MIN_SQUAD} players
              </Text>
            </View>
          )}

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#34d399" }]} onPress={() => router.push("/results")}>
            <Text style={styles.actionBtnText}>View Results</Text>
          </TouchableOpacity>

          {truly_unsold.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#fbbf24", marginTop: 0 }]}
              onPress={() => {
                Alert.alert(
                  "Re-auction Unsold Players",
                  `${truly_unsold.length} players remain unsold. Re-auction them at 50% base price?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Start Re-auction", onPress: reAuctionUnsold },
                  ]
                );
              }}
            >
              <Text style={styles.actionBtnText}>Re-auction {truly_unsold.length} Unsold</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#1a1a1a", marginTop: 0, borderWidth: 1, borderColor: "#ef444440" }]}
            onPress={() => {
              Alert.alert("Reset Auction", "This will reset all bids. Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: resetAuction },
              ]);
            }}
          >
            <Text style={[styles.actionBtnText, { color: "#ef4444" }]}>Reset Auction</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentPlayer) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* SOLD flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "#34d399",
            opacity: soldFlashAnim,
            zIndex: 100,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={styles.soldFlashText}>SOLD!</Text>
        {currentBidTeam && <Text style={styles.soldFlashTeam}>{currentBidTeam.name}</Text>}
      </Animated.View>

      {/* Glass Header */}
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.glassHeader, { paddingTop: topPadding + 8, borderBottomColor: "rgba(255,255,255,0.06)" }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Live Auction</Text>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {auctionState.currentPlayerIndex + 1}/{unsoldPlayers.length}
        </Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 120 }}>
        {/* Glass Player Card with Liquid RGB Glow */}
        <Animated.View
          style={[
            styles.glassPlayerCard,
            {
              opacity: cardGlowOpacity,
              borderColor: flowAnim.interpolate({
                inputRange: [0, 0.3, 0.5, 0.7, 1],
                outputRange: ['rgba(255,255,255,0.05)', '#ff000088', '#00ff0088', '#0000ff88', 'rgba(255,255,255,0.05)']
              }),
              borderWidth: 2,
              shadowColor: flowAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['transparent', '#a78bfa44', 'transparent']
              }),
              shadowRadius: 40,
              shadowOpacity: 0.6,
              elevation: 15,
            },
          ]}
        >
          <LinearGradient
            colors={[roleColor + "30", roleColor + "10"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {currentPlayer.image ? (
              <Image source={{ uri: currentPlayer.image }} style={styles.playerAvatarImg} />
            ) : (
              <View style={[styles.playerAvatar, { backgroundColor: roleColor + "40" }]}>
                <Text style={styles.playerAvatarText}>{currentPlayer.name.charAt(0)}</Text>
              </View>
            )}
            <Text style={styles.auctionPlayerName}>{currentPlayer.name}</Text>
            <Text style={styles.auctionPlayerMeta}>
              {currentPlayer.country} · {currentPlayer.role}
            </Text>

            <View style={styles.statsChips}>
              {currentPlayer.stats.runs !== undefined && (
                <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                  <Text style={styles.statChipVal}>{currentPlayer.stats.runs}</Text>
                  <Text style={styles.statChipLabel}>Runs</Text>
                </View>
              )}
              {currentPlayer.stats.wickets !== undefined && (
                <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                  <Text style={styles.statChipVal}>{currentPlayer.stats.wickets}</Text>
                  <Text style={styles.statChipLabel}>Wkts</Text>
                </View>
              )}
              {currentPlayer.stats.average !== undefined && (
                <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                  <Text style={styles.statChipVal}>{currentPlayer.stats.average}</Text>
                  <Text style={styles.statChipLabel}>Avg</Text>
                </View>
              )}
              <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                <Text style={styles.statChipVal}>{currentPlayer.stats.matches}</Text>
                <Text style={styles.statChipLabel}>Matches</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Glass Bid Section */}
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.glassBidSection, { borderColor: "rgba(255,255,255,0.06)" }]}
        >
          <View style={styles.bidRow}>
            <View>
              <Text style={[styles.bidLabel, { color: colors.mutedForeground }]}>
                {auctionState.currentBidTeamId ? "Current Bid" : "Base Price"}
              </Text>
              <Animated.Text
                style={[
                  styles.bidAmount,
                  {
                    color: "#ffffff",
                    textShadowColor: "#818cf8",
                    textShadowRadius: 25,
                    transform: [{ scale: bidScaleAnim }],
                  },
                ]}
              >
                ₹{auctionState.currentBid}L
              </Animated.Text>
            </View>
            {currentBidTeam && (
              <View style={[styles.bidTeamBadge, { backgroundColor: currentBidTeam.color + "30", borderColor: currentBidTeam.color + "60" }]}>
                <Text style={[styles.bidTeamText, { color: currentBidTeam.color }]}>{currentBidTeam.shortName}</Text>
                <Text style={styles.bidTeamName}>{currentBidTeam.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.sellPassRow}>
            <TouchableOpacity
              style={[styles.glassPassBtn, { borderColor: "rgba(255,255,255,0.08)" }]}
              onPress={() => {
                Alert.alert("Pass Player", "Skip this player?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Pass", onPress: passPlayer },
                ]);
              }}
            >
              <Feather name="skip-forward" size={20} color={colors.mutedForeground} />
              <Text style={[styles.passBtnText, { color: colors.mutedForeground }]}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.glassSellBtn, { opacity: auctionState.currentBidTeamId ? 1 : 0.4 }]}
              onPress={handleSell}
              disabled={!auctionState.currentBidTeamId}
            >
              <LinearGradient
                colors={auctionState.currentBidTeamId ? ["#34d399", "#10b981"] : ["#1a1a1a", "#1a1a1a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sellGradient}
              >
                <Feather name="check" size={20} color={auctionState.currentBidTeamId ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.sellBtnText, { color: auctionState.currentBidTeamId ? "#fff" : colors.mutedForeground }]}>
                  SOLD!
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Team Bidding Grid */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Place Bid</Text>
        <View style={styles.teamsGrid}>
          {teams.map((team) => {
            const canBid = team.remainingBudget >= auctionState.currentBid + 10;
            const isLeading = auctionState.currentBidTeamId === team.id;
            const teamPlayers = players.filter((p) => p.teamId === team.id);
            const needsPlayers = teamPlayers.length < MIN_SQUAD;
            return (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.glassTeamCard,
                  {
                    backgroundColor: isLeading ? team.color + "30" : "rgba(255,255,255,0.04)",
                    borderColor: isLeading ? team.color : needsPlayers ? "#fbbf2440" : "rgba(255,255,255,0.06)",
                    borderWidth: isLeading ? 2 : 1,
                    opacity: canBid ? 1 : 0.4,
                    shadowColor: isLeading ? team.color : 'transparent',
                    shadowRadius: isLeading ? 20 : 0,
                    shadowOpacity: isLeading ? 0.3 : 0,
                    elevation: isLeading ? 10 : 0,
                  },
                ]}
                onPress={() => canBid && placeBid(team.id)}
                disabled={!canBid}
              >
                <Text style={[styles.teamBidShort, { color: isLeading ? "#fff" : team.color }]}>
                  {team.shortName}
                </Text>
                <Text style={[styles.teamBidName, { color: isLeading ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]} numberOfLines={1}>
                  {team.name}
                </Text>
                <Text style={[styles.teamBidBudget, { color: isLeading ? "#fff" : colors.foreground }]}>
                  ₹{team.remainingBudget}L
                </Text>
                <Text style={[styles.teamBidPlayers, { color: needsPlayers && !isLeading ? "#fbbf24" : isLeading ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                  {teamPlayers.length}/{MIN_SQUAD}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bid History */}
        {auctionState.biddingHistory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bid History</Text>
            {[...auctionState.biddingHistory].reverse().slice(0, 5).map((bid, i) => {
              const t = teams.find((te) => te.id === bid.teamId);
              return (
                <LinearGradient
                  key={i}
                  colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.glassHistoryItem, { borderColor: "rgba(255,255,255,0.06)" }]}
                >
                  <View style={[styles.historyDot, { backgroundColor: t?.color || colors.primary }]} />
                  <Text style={[styles.historyTeam, { color: colors.foreground }]}>{t?.name || "Unknown"}</Text>
                  <Text style={[styles.historyAmount, { color: "#818cf8", textShadowColor: "#818cf8", textShadowRadius: 10 }]}>₹{bid.amount}L</Text>
                </LinearGradient>
              );
            })}
          </>
        )}
      </ScrollView>
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
  headerIcon: {
    padding: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  progressText: { fontSize: 14, fontWeight: "600" },
  centerMsg: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12,
  },
  msgTitle: { fontSize: 22, fontWeight: "700" },
  msgSub: { fontSize: 15, textAlign: "center" },
  actionButton: {
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 8, minWidth: 220, alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  warnBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4,
  },
  warnText: { fontSize: 13, fontWeight: "600", flex: 1 },
  soldFlashText: { color: "#fff", fontSize: 64, fontWeight: "900", letterSpacing: 4 },
  soldFlashTeam: { color: "rgba(255,255,255,0.85)", fontSize: 22, fontWeight: "700", marginTop: 8 },
  
  // Glass Player Card
  glassPlayerCard: {
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  cardGradient: {
    padding: 24,
    alignItems: "center",
  },
  playerAvatar: {
    width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  playerAvatarImg: {
    width: 90, height: 90, borderRadius: 45, marginBottom: 12, borderWidth: 3, borderColor: "rgba(255,255,255,0.2)",
  },
  playerAvatarText: { fontSize: 36, fontWeight: "800", color: "#fff" },
  auctionPlayerName: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center" },
  auctionPlayerMeta: { fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4, marginBottom: 16 },
  statsChips: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  statChip: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statChipVal: { fontSize: 18, fontWeight: "700", color: "#fff" },
  statChipLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 },

  // Glass Bid Section
  glassBidSection: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  bidRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  bidLabel: { fontSize: 13, marginBottom: 4 },
  bidAmount: { fontSize: 36, fontWeight: "800" },
  bidTeamBadge: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  bidTeamText: { fontSize: 18, fontWeight: "800" },
  bidTeamName: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 },
  sellPassRow: { flexDirection: "row", gap: 10 },
  glassPassBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  passBtnText: { fontSize: 15, fontWeight: "600" },
  glassSellBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: "hidden",
  },
  sellGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  sellBtnText: { fontSize: 16, fontWeight: "800" },

  sectionTitle: { fontSize: 18, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 },
  teamsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  glassTeamCard: {
    width: (width - 42) / 2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  teamBidShort: { fontSize: 20, fontWeight: "800" },
  teamBidName: { fontSize: 11, marginTop: 2, textAlign: "center" },
  teamBidBudget: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  teamBidPlayers: { fontSize: 11, marginTop: 2 },
  
  glassHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyTeam: { flex: 1, fontSize: 14, fontWeight: "600" },
  historyAmount: { fontSize: 14, fontWeight: "700" },
});
