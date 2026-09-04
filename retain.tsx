import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuction } from "@/context/AuctionContext";

const MAX_RETAIN = 6;

export default function RetainScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { players, teams, updatePlayer, updateTeam } = useAuction();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId]
  );

  const retainedByTeam = useMemo(() => {
    const map: Record<string, typeof players> = {};
    teams.forEach((t) => { map[t.id] = []; });
    players.forEach((p) => {
      if (p.teamId && map[p.teamId]) map[p.teamId].push(p);
    });
    return map;
  }, [players, teams]);

  const availablePlayers = useMemo(
    () => players.filter((p) => !p.teamId),
    [players]
  );

  const handleRetain = async (playerId: string) => {
    if (!selectedTeamId || !selectedTeam) return;
    const retained = retainedByTeam[selectedTeamId] || [];
    if (retained.length >= MAX_RETAIN) {
      Alert.alert("Limit Reached", `Each team can retain a maximum of ${MAX_RETAIN} players.`);
      return;
    }
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    await updatePlayer(playerId, { teamId: selectedTeamId, soldPrice: player.basePrice });
    await updateTeam(selectedTeamId, {
      remainingBudget: selectedTeam.remainingBudget - player.basePrice,
      players: [...selectedTeam.players, playerId],
    });
  };

  const handleRelease = async (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !player.teamId) return;
    const team = teams.find((t) => t.id === player.teamId);
    if (!team) return;

    Alert.alert("Release Player", `Remove ${player.name} from ${team.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Release",
        style: "destructive",
        onPress: async () => {
          await updatePlayer(playerId, { teamId: null, soldPrice: undefined });
          await updateTeam(team.id, {
            remainingBudget: team.remainingBudget + (player.soldPrice || player.basePrice),
            players: team.players.filter((id) => id !== playerId),
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>⭐ Retain Players</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Up to {MAX_RETAIN} players per team</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 32 }}>

        {/* Team Selector */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Team</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamRow}>
          {teams.map((team) => {
            const retained = retainedByTeam[team.id]?.length || 0;
            const isSelected = selectedTeamId === team.id;
            return (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.glassTeamChip,
                  {
                    backgroundColor: isSelected ? team.color + "30" : "rgba(255,255,255,0.04)",
                    borderColor: isSelected ? team.color : "rgba(255,255,255,0.06)",
                    borderWidth: isSelected ? 2 : 1,
                    shadowColor: isSelected ? team.color : 'transparent',
                    shadowRadius: isSelected ? 15 : 0,
                    shadowOpacity: isSelected ? 0.3 : 0,
                    elevation: isSelected ? 8 : 0,
                  },
                ]}
                onPress={() => setSelectedTeamId(team.id)}
              >
                <Text style={[styles.teamChipShort, { color: isSelected ? "#fff" : team.color }]}>{team.shortName}</Text>
                <Text style={[styles.teamChipName, { color: isSelected ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]} numberOfLines={1}>
                  {team.name}
                </Text>
                <View style={[styles.retainBadge, { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }]}>
                  <Text style={[styles.retainBadgeText, { color: isSelected ? "#fff" : colors.mutedForeground }]}>
                    {retained}/{MAX_RETAIN}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Retained Players for selected team */}
        {selectedTeam && retainedByTeam[selectedTeam.id]?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Retained — {selectedTeam.name}
            </Text>
            {retainedByTeam[selectedTeam.id].map((player) => (
              <LinearGradient
                key={player.id}
                colors={[selectedTeam.color + "20", selectedTeam.color + "08"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.glassPlayerRow, { borderColor: selectedTeam.color + "30" }]}
              >
                {player.image ? (
                  <Image source={{ uri: player.image }} style={styles.playerImg} />
                ) : (
                  <View style={[styles.playerAvatar, { backgroundColor: selectedTeam.color }]}>
                    <Text style={styles.playerAvatarText}>{player.name.charAt(0)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.playerName, { color: colors.foreground }]}>{player.name}</Text>
                  <Text style={[styles.playerMeta, { color: colors.mutedForeground }]}>
                    {player.role} · ₹{player.basePrice}L retained
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.glassReleaseBtn, { borderColor: "#ef444440" }]}
                  onPress={() => handleRelease(player.id)}
                >
                  <Feather name="x" size={16} color="#ef4444" />
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </>
        )}

        {/* Available Players */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {selectedTeam
            ? `Pick Players for ${selectedTeam.name} (${retainedByTeam[selectedTeam.id]?.length || 0}/${MAX_RETAIN})`
            : "Available Players"}
        </Text>

        {!selectedTeamId && (
          <View style={styles.hintBox}>
            <Feather name="arrow-up" size={20} color={colors.mutedForeground} />
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              Select a team above to start retaining players
            </Text>
          </View>
        )}

        {availablePlayers.length === 0 && selectedTeamId && (
          <View style={styles.hintBox}>
            <Feather name="check-circle" size={20} color="#34d399" />
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              All players have been retained
            </Text>
          </View>
        )}

        {availablePlayers.map((player) => {
          const canRetain = selectedTeamId && (retainedByTeam[selectedTeamId]?.length || 0) < MAX_RETAIN;
          return (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.glassPlayerRow,
                {
                  borderColor: "rgba(255,255,255,0.06)",
                  opacity: !selectedTeamId ? 0.5 : 1,
                },
              ]}
              onPress={() => canRetain && handleRetain(player.id)}
              disabled={!selectedTeamId}
            >
              {player.image ? (
                <Image source={{ uri: player.image }} style={styles.playerImg} />
              ) : (
                <View style={[styles.playerAvatar, { backgroundColor: "#818cf8" }]}>
                  <Text style={styles.playerAvatarText}>{player.name.charAt(0)}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.playerName, { color: colors.foreground }]}>{player.name}</Text>
                <Text style={[styles.playerMeta, { color: colors.mutedForeground }]}>
                  {player.role} · {player.country} · ₹{player.basePrice}L base
                </Text>
              </View>
              {selectedTeamId && (
                <LinearGradient
                  colors={canRetain ? ["#818cf8", "#a78bfa"] : ["#1a1a1a", "#1a1a1a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.glassAddBtn, { opacity: canRetain ? 1 : 0.3 }]}
                >
                  <Feather name="plus" size={18} color={canRetain ? "#fff" : colors.mutedForeground} />
                </LinearGradient>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glassHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerIcon: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  teamRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  glassTeamChip: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    minWidth: 90,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  teamChipShort: { fontSize: 18, fontWeight: "800" },
  teamChipName: { fontSize: 11, marginTop: 2, textAlign: "center" },
  retainBadge: {
    marginTop: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  retainBadgeText: { fontSize: 11, fontWeight: "700" },
  glassPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  playerImg: { width: 44, height: 44, borderRadius: 22 },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  playerAvatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  playerName: { fontSize: 15, fontWeight: "700" },
  playerMeta: { fontSize: 12, marginTop: 2 },
  glassReleaseBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  glassAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    padding: 16,
  },
  hintText: { fontSize: 14 },
});
